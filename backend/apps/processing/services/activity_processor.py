from django.utils import timezone

from apps.payloads.models import RawPayload
from apps.processing.models import ProcessRun


def extract_uuids(obj):
    uuids = []

    def walk(x):
        if isinstance(x, dict):
            for k, v in x.items():
                if k == "uuid" and isinstance(v, str):
                    uuids.append(v)
                else:
                    walk(v)
        elif isinstance(x, list):
            for item in x:
                walk(item)

    walk(obj)
    return uuids


def create_detail_payloads(uuid_list, source_name=None):
    created = 0
    skipped = 0

    unique_uuids = list(dict.fromkeys(uuid_list))

    for uuid in unique_uuids:
        exists_in_details = RawPayload.objects.filter(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid=uuid,
        ).exists()

        if exists_in_details:
            skipped += 1
            continue

        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            source_name=source_name or "generated_from_activity",
            external_uuid=uuid,
            raw_data={
                "uuid": uuid,
                "payload": {}
            },
            ingestion_status=RawPayload.IngestionStatus.SAVED,
            processing_status=RawPayload.ProcessingStatus.PENDING,
            processing_attempts=0,
        )
        created += 1

    return created, skipped


def process_pending_activities():
    pending_payloads = RawPayload.objects.filter(
        payload_type=RawPayload.PayloadType.ACTIVITY,
        processing_status=RawPayload.ProcessingStatus.PENDING,
    ).order_by("created_at")

    process_run = ProcessRun.objects.create(
        process_type=ProcessRun.ProcessType.ACTIVITIES,
        status=ProcessRun.Status.RUNNING,
        started_at=timezone.now(),
        total_records=pending_payloads.count(),
        notes="Inicio de procesamiento manual de activities.",
    )

    processed_count = 0
    failed_count = 0
    total_detail_created = 0
    total_detail_skipped = 0

    for payload in pending_payloads:
        try:
            payload.processing_status = RawPayload.ProcessingStatus.PROCESSING
            payload.processing_error = None
            payload.processing_attempts += 1
            payload.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "processing_attempts",
                    "updated_at",
                ]
            )

            raw_data = payload.raw_data

            if raw_data is None:
                raise ValueError("El payload no contiene raw_data.")

            extracted_uuids = extract_uuids(raw_data)

            created, skipped = create_detail_payloads(
                extracted_uuids,
                source_name=f"generated_from_activity:{payload.external_uuid or payload.id}",
            )

            total_detail_created += created
            total_detail_skipped += skipped

            payload.processing_status = RawPayload.ProcessingStatus.PROCESSED
            payload.last_processed_at = timezone.now()
            payload.processing_error = None
            payload.save(
                update_fields=[
                    "processing_status",
                    "last_processed_at",
                    "processing_error",
                    "updated_at",
                ]
            )

            processed_count += 1

        except Exception as exc:
            payload.processing_status = RawPayload.ProcessingStatus.FAILED
            payload.processing_error = str(exc)
            payload.last_processed_at = timezone.now()
            payload.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "last_processed_at",
                    "updated_at",
                ]
            )

            failed_count += 1

    final_status = (
        ProcessRun.Status.COMPLETED
        if failed_count == 0
        else ProcessRun.Status.FAILED
    )

    process_run.status = final_status
    process_run.finished_at = timezone.now()
    process_run.processed_records = processed_count
    process_run.failed_records = failed_count
    process_run.notes = (
        f"Procesamiento de activities finalizado. "
        f"Activities procesadas: {processed_count}. "
        f"Activities fallidas: {failed_count}. "
        f"Details creados: {total_detail_created}. "
        f"Details omitidos por duplicado: {total_detail_skipped}."
    )
    process_run.save(
        update_fields=[
            "status",
            "finished_at",
            "processed_records",
            "failed_records",
            "notes",
            "updated_at",
        ]
    )

    return {
        "process_run_id": process_run.id,
        "status": str(process_run.status),
        "total_records": process_run.total_records,
        "processed_records": processed_count,
        "failed_records": failed_count,
        "detail_created": total_detail_created,
        "detail_skipped": total_detail_skipped,
    }