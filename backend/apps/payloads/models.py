from django.db import models


class RawPayload(models.Model):
    class PayloadType(models.TextChoices):
        ACTIVITY = "activity", "Activity"
        DETAIL = "detail", "Detail"

    class IngestionStatus(models.TextChoices):
        RECEIVED = "received", "Received"
        SAVED = "saved", "Saved"
        FAILED = "failed", "Failed"

    class ProcessingStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        PROCESSED = "processed", "Processed"
        FAILED = "failed", "Failed"

    payload_type = models.CharField(
        max_length=20,
        choices=PayloadType.choices,
    )
    source_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Nombre del archivo o lote de origen",
    )
    external_uuid = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        help_text="UUID o identificador externo del payload",
    )
    raw_data = models.JSONField(
        help_text="Payload crudo almacenado en formato JSON"
    )

    ingestion_status = models.CharField(
        max_length=20,
        choices=IngestionStatus.choices,
        default=IngestionStatus.SAVED,
    )
    ingestion_error = models.TextField(
        blank=True,
        null=True,
    )

    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING,
    )
    processing_attempts = models.PositiveIntegerField(
        default=0
    )
    processing_error = models.TextField(
        blank=True,
        null=True,
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )
    last_processed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "raw_payloads"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["payload_type", "processing_status"]),
            models.Index(fields=["payload_type", "external_uuid"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["payload_type", "external_uuid"],
                name="unique_payload_type_external_uuid",
            )
        ]

    def __str__(self):
        return f"{self.payload_type} - {self.external_uuid or self.id}"