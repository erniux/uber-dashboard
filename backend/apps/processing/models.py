from django.db import models


class ProcessRun(models.Model):
    class ProcessType(models.TextChoices):
        ACTIVITIES = "activities", "Activities"
        DETAILS = "details", "Details"
        METRICS = "metrics", "Metrics"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    process_type = models.CharField(
        max_length=20,
        choices=ProcessType.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    started_at = models.DateTimeField(
        blank=True,
        null=True,
    )
    finished_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    total_records = models.PositiveIntegerField(default=0)
    processed_records = models.PositiveIntegerField(default=0)
    failed_records = models.PositiveIntegerField(default=0)

    notes = models.TextField(
        blank=True,
        null=True,
    )
    error_message = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "process_runs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.process_type} - {self.status} - {self.created_at:%Y-%m-%d %H:%M:%S}"