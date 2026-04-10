from django.utils import timezone

from apps.payloads.models import RawPayload
from apps.processing.models import ProcessRun
from apps.metrics.services.trip_upsert import upsert_uber_trip_from_payload

def has_real_detail_payload(raw_data):
    """
    Valida si el raw_data del detail ya contiene payload real de Uber.

    Acepta dos formatos:

    Formato A:
    {
        "uuid": "...",
        "payload": {...}
    }

    Formato B:
    {
        "data": {...}
    }

    También evita considerar válido el placeholder vacío:
    {
        "uuid": "...",
        "payload": {}
    }
    """
    if not isinstance(raw_data, dict):
        return False

    # Caso 1: payload envuelto en la llave "payload"
    if "payload" in raw_data:
        payload = raw_data.get("payload")

        if payload is None:
            return False

        if isinstance(payload, dict):
            return len(payload) > 0

        if isinstance(payload, list):
            return len(payload) > 0

        return bool(payload)

    # Caso 2: payload crudo directo en raw_data
    return len(raw_data) > 0



def process_pending_details():
    pending_payloads = RawPayload.objects.filter(
        payload_type=RawPayload.PayloadType.DETAIL,
        processing_status=RawPayload.ProcessingStatus.PENDING,
    ).order_by("created_at")

    process_run = ProcessRun.objects.create(
        process_type=ProcessRun.ProcessType.DETAILS,
        status=ProcessRun.Status.RUNNING,
        started_at=timezone.now(),
        total_records=pending_payloads.count(),
        notes="Inicio de procesamiento manual de details.",
    )

    processed_count = 0
    failed_count = 0
    skipped_without_real_payload = 0

    for payload in pending_payloads:
        try:
            raw_data = payload.raw_data

            if not has_real_detail_payload(raw_data):
                skipped_without_real_payload += 1
                continue

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

            # ---------------------------------------------------------
            # lógica real de uber_metrics.py
            # ---------------------------------------------------------
            upsert_uber_trip_from_payload(payload)

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

            upsert_uber_trip_from_payload(payload)

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
        f"Procesamiento de details finalizado. "
        f"Details procesados: {processed_count}. "
        f"Details fallidos: {failed_count}. "
        f"Details omitidos por payload vacío: {skipped_without_real_payload}."
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
        "skipped_without_real_payload": skipped_without_real_payload,
    }

def extract_detail_fields(raw_data):
    pass

def upsert_uber_trip_from_payload(payload):
    pass