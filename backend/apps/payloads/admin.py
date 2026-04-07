from django.contrib import admin
from .models import RawPayload


@admin.register(RawPayload)
class RawPayloadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "payload_type",
        "external_uuid",
        "source_name",
        "ingestion_status",
        "processing_status",
        "processing_attempts",
        "uploaded_at",
        "last_processed_at",
    )
    list_filter = (
        "payload_type",
        "ingestion_status",
        "processing_status",
    )
    search_fields = (
        "external_uuid",
        "source_name",
    )
    readonly_fields = (
        "uploaded_at",
        "created_at",
        "updated_at",
        "last_processed_at",
    )