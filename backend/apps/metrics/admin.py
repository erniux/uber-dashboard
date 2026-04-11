from django.contrib import admin

from apps.metrics.models import OperatingCost, UberTrip


@admin.register(UberTrip)
class UberTripAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "uuid",
        "service_type",
        "service_group",
        "status_type",
        "gross_amount",
        "distance_km",
        "duration_minutes",
        "requested_at",
        "created_at",
    )
    search_fields = (
        "uuid",
        "service_type",
        "pickup_address",
        "dropoff_address",
    )
    list_filter = (
        "service_group",
        "status_type",
        "is_completed",
        "is_canceled",
        "is_pool_type",
        "is_surge",
        "requested_date",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(OperatingCost)
class OperatingCostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cost_date",
        "category",
        "title",
        "amount",
        "created_at",
    )
    search_fields = (
        "title",
        "description",
    )
    list_filter = (
        "category",
        "cost_date",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
