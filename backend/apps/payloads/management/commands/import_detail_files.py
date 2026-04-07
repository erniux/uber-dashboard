import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.payloads.models import RawPayload


def find_first_uuid(obj):
    """
    Busca el primer campo 'uuid' válido dentro de un JSON anidado.
    """
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == "uuid" and isinstance(value, str) and value.strip():
                return value
            result = find_first_uuid(value)
            if result:
                return result

    elif isinstance(obj, list):
        for item in obj:
            result = find_first_uuid(item)
            if result:
                return result

    return None


def extract_detail_uuid(payload_data):
    """
    Intenta obtener el UUID del detail en varios formatos esperados.
    """
    if not isinstance(payload_data, dict):
        return None

    # Caso 1: uuid en raíz
    root_uuid = payload_data.get("uuid")
    if isinstance(root_uuid, str) and root_uuid.strip():
        return root_uuid

    # Caso 2: data.metadata.uuid
    data = payload_data.get("data")
    if isinstance(data, dict):
        metadata = data.get("metadata")
        if isinstance(metadata, dict):
            metadata_uuid = metadata.get("uuid")
            if isinstance(metadata_uuid, str) and metadata_uuid.strip():
                return metadata_uuid

    # Caso 3: búsqueda recursiva general
    return find_first_uuid(payload_data)


class Command(BaseCommand):
    help = "Importa archivos JSON de details y actualiza raw_data en RawPayload tipo detail"

    def handle(self, *args, **options):
        input_dir = Path("/app/uber_details_input")

        if not input_dir.exists():
            self.stdout.write(self.style.ERROR(f"No existe la carpeta: {input_dir}"))
            return

        json_files = sorted(input_dir.glob("*.json"))

        if not json_files:
            self.stdout.write(self.style.WARNING(f"No se encontraron archivos JSON en {input_dir}"))
            return

        updated_count = 0
        not_found_count = 0
        skipped_processed_count = 0
        failed_count = 0

        for file_path in json_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    payload_data = json.load(f)

                if not isinstance(payload_data, dict):
                    raise ValueError("El archivo no contiene un objeto JSON válido.")

                uuid_value = extract_detail_uuid(payload_data)

                if not uuid_value:
                    raise ValueError("El archivo no contiene un campo 'uuid' válido.")

                detail = RawPayload.objects.filter(
                    payload_type=RawPayload.PayloadType.DETAIL,
                    external_uuid=uuid_value,
                ).first()

                if not detail:
                    not_found_count += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f"[NO ENCONTRADO] UUID {uuid_value} en archivo {file_path.name}"
                        )
                    )
                    continue

                if detail.processing_status == RawPayload.ProcessingStatus.PROCESSED:
                    skipped_processed_count += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f"[OMITIDO] UUID {uuid_value} ya está processed ({file_path.name})"
                        )
                    )
                    continue

                with transaction.atomic():
                    detail.raw_data = payload_data
                    detail.source_name = file_path.name
                    detail.ingestion_status = RawPayload.IngestionStatus.SAVED
                    detail.ingestion_error = None

                    if detail.processing_status == RawPayload.ProcessingStatus.FAILED:
                        detail.processing_status = RawPayload.ProcessingStatus.PENDING
                        detail.processing_error = None

                    detail.save(
                        update_fields=[
                            "raw_data",
                            "source_name",
                            "ingestion_status",
                            "ingestion_error",
                            "processing_status",
                            "processing_error",
                            "updated_at",
                        ]
                    )

                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"[ACTUALIZADO] UUID {uuid_value} desde {file_path.name}"
                    )
                )

            except Exception as exc:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"[ERROR] Archivo {file_path.name}: {str(exc)}"
                    )
                )

        self.stdout.write("-" * 60)
        self.stdout.write(self.style.SUCCESS("Importación de detail files finalizada."))
        self.stdout.write(f"Actualizados: {updated_count}")
        self.stdout.write(f"No encontrados: {not_found_count}")
        self.stdout.write(f"Omitidos por processed: {skipped_processed_count}")
        self.stdout.write(f"Errores: {failed_count}")