from django.db import models

from apps.payloads.models import RawPayload


class UberTrip(models.Model):
    SERVICE_GROUP_CHOICES = [
        ("mobility", "Mobility"),
        ("delivery", "Delivery"),
        ("shopping", "Shopping"),
        ("other", "Other"),
    ]

    raw_payload = models.OneToOneField(
        RawPayload,
        on_delete=models.CASCADE,
        related_name="uber_trip",
        limit_choices_to={"payload_type": RawPayload.PayloadType.DETAIL},
    )
    uuid = models.CharField(max_length=255, unique=True)

    status_type = models.CharField(max_length=50, blank=True, default="")
    is_completed = models.BooleanField(default=False)
    is_canceled = models.BooleanField(default=False)

    service_type = models.CharField(max_length=100, blank=True, default="")
    service_group = models.CharField(
        max_length=20,
        choices=SERVICE_GROUP_CHOICES,
        default="other",
    )

    requested_at = models.DateTimeField(blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, default="")

    requested_date = models.DateField(blank=True, null=True)
    requested_time = models.TimeField(blank=True, null=True)
    day_of_week = models.CharField(max_length=20, blank=True, default="")
    hour_of_day = models.PositiveSmallIntegerField(blank=True, null=True)
    time_bucket = models.CharField(max_length=20, blank=True, default="")

    distance_km = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duration_minutes = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    trip_leg_count = models.PositiveIntegerField(default=0)
    is_pool_type = models.BooleanField(default=False)
    is_surge = models.BooleanField(default=False)

    pickup_address = models.TextField(blank=True, default="")
    dropoff_address = models.TextField(blank=True, default="")

    pickup_lat = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)
    pickup_lng = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)
    dropoff_lat = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)
    dropoff_lng = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)

    gross_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    estimated_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    trip_balance_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    promotion_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    taxes_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    earnings_per_km = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    earnings_per_minute = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    extra_attributes = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-requested_at", "-created_at"]
        verbose_name = "Uber Trip"
        verbose_name_plural = "Uber Trips"

    def __str__(self):
        return f"{self.service_type or 'Trip'} - {self.uuid}"
