from decimal import Decimal

from django.db.models import Avg, Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce

from apps.metrics.models import UberTrip


TIME_BUCKET_ORDER = ["madrugada", "mañana", "tarde", "noche", ""]
DECIMAL_OUTPUT = DecimalField(max_digits=12, decimal_places=2)
DECIMAL_ZERO = Value(Decimal("0.00"), output_field=DECIMAL_OUTPUT)
PERCENT_OUTPUT = DecimalField(max_digits=7, decimal_places=2)


def get_filtered_trips(*, start_date=None, end_date=None):
    queryset = UberTrip.objects.all()

    if start_date:
        queryset = queryset.filter(requested_date__gte=start_date)

    if end_date:
        queryset = queryset.filter(requested_date__lte=end_date)

    return queryset


def get_summary_metrics(*, start_date=None, end_date=None):
    queryset = get_filtered_trips(start_date=start_date, end_date=end_date)

    summary = queryset.aggregate(
        total_trips=Count("id"),
        completed_trips=Count("id", filter=Q(is_completed=True)),
        canceled_trips=Count("id", filter=Q(is_canceled=True)),
        total_gross_amount=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        average_gross_amount=Coalesce(Avg("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        total_distance_km=Coalesce(Sum("distance_km"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        average_distance_km=Coalesce(Avg("distance_km"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        total_duration_minutes=Coalesce(Sum("duration_minutes"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        average_duration_minutes=Coalesce(Avg("duration_minutes"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
    )

    total_trips = summary["total_trips"] or 0
    total_gross_amount = summary["total_gross_amount"] or Decimal("0.00")
    total_distance_km = summary["total_distance_km"] or Decimal("0.00")
    total_duration_minutes = summary["total_duration_minutes"] or Decimal("0.00")
    completed_trips = summary["completed_trips"] or 0
    canceled_trips = summary["canceled_trips"] or 0

    completion_rate = (
        (Decimal(completed_trips) / Decimal(total_trips) * Decimal("100")).quantize(Decimal("0.01"))
        if total_trips
        else Decimal("0.00")
    )
    cancellation_rate = (
        (Decimal(canceled_trips) / Decimal(total_trips) * Decimal("100")).quantize(Decimal("0.01"))
        if total_trips
        else Decimal("0.00")
    )
    gross_per_trip = (
        (total_gross_amount / Decimal(total_trips)).quantize(Decimal("0.01"))
        if total_trips
        else Decimal("0.00")
    )
    gross_per_km = (
        (total_gross_amount / total_distance_km).quantize(Decimal("0.01"))
        if total_distance_km
        else Decimal("0.00")
    )
    gross_per_hour = (
        (total_gross_amount / (total_duration_minutes / Decimal("60"))).quantize(Decimal("0.01"))
        if total_duration_minutes
        else Decimal("0.00")
    )

    return {
        **summary,
        "completion_rate": completion_rate,
        "cancellation_rate": cancellation_rate,
        "gross_per_trip": gross_per_trip,
        "gross_per_km": gross_per_km,
        "gross_per_hour": gross_per_hour,
        "filters": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
        },
    }


def get_service_breakdown(*, start_date=None, end_date=None):
    queryset = get_filtered_trips(start_date=start_date, end_date=end_date)

    rows = queryset.values("service_group", "service_type").annotate(
        trips_count=Count("id"),
        completed_trips=Count("id", filter=Q(is_completed=True)),
        canceled_trips=Count("id", filter=Q(is_canceled=True)),
        gross_amount_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        distance_km_total=Coalesce(Sum("distance_km"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        duration_minutes_total=Coalesce(Sum("duration_minutes"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        average_gross_amount=Coalesce(Avg("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
    ).order_by("-gross_amount_total", "-trips_count", "service_type")

    return list(rows)


def get_time_bucket_breakdown(*, start_date=None, end_date=None):
    queryset = get_filtered_trips(start_date=start_date, end_date=end_date)

    rows = list(
        queryset.values("time_bucket").annotate(
            trips_count=Count("id"),
            completed_trips=Count("id", filter=Q(is_completed=True)),
            canceled_trips=Count("id", filter=Q(is_canceled=True)),
            gross_amount_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
            distance_km_total=Coalesce(Sum("distance_km"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
            duration_minutes_total=Coalesce(Sum("duration_minutes"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        )
    )

    order_map = {bucket: index for index, bucket in enumerate(TIME_BUCKET_ORDER)}
    rows.sort(key=lambda row: (order_map.get(row["time_bucket"], len(TIME_BUCKET_ORDER)), row["time_bucket"] or ""))
    return rows


def get_daily_breakdown(*, start_date=None, end_date=None):
    queryset = get_filtered_trips(start_date=start_date, end_date=end_date)

    rows = queryset.values("requested_date").annotate(
        trips_count=Count("id"),
        completed_trips=Count("id", filter=Q(is_completed=True)),
        canceled_trips=Count("id", filter=Q(is_canceled=True)),
        gross_amount_total=Coalesce(Sum("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        distance_km_total=Coalesce(Sum("distance_km"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        duration_minutes_total=Coalesce(Sum("duration_minutes"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
        average_gross_amount=Coalesce(Avg("gross_amount"), DECIMAL_ZERO, output_field=DECIMAL_OUTPUT),
    ).order_by("requested_date")

    return list(rows)
