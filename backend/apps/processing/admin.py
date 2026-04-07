from django.contrib import admin
from .models import ProcessRun


@admin.register(ProcessRun)
class ProcessRunAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "process_type",
        "status",
        "total_records",
        "processed_records",
        "failed_records",
        "started_at",
        "finished_at",
        "created_at",
    )
    list_filter = (
        "process_type",
        "status",
    )
    search_fields = (
        "notes",
        "error_message",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )