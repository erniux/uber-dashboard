from apps.metrics.models import UberTrip
from apps.metrics.services.trip_extractor import extract_basic_trip_data


def upsert_uber_trip_from_payload(raw_payload):
    """
    Crea o actualiza un UberTrip a partir de un RawPayload tipo detail.
    """
    trip_data = extract_basic_trip_data(raw_payload.raw_data)

    uuid_value = trip_data.get("uuid")
    if not uuid_value:
        raise ValueError("No se pudo extraer el uuid del detail.")

    defaults = {
        "raw_payload": raw_payload,
        "status_type": trip_data.get("status_type"),
        "is_completed": trip_data.get("is_completed", False),
        "is_canceled": trip_data.get("is_canceled", False),
        "service_type": trip_data.get("service_type"),
        "service_group": trip_data.get("service_group", "other"),
        "requested_at": trip_data.get("requested_at"),
        "timezone": trip_data.get("timezone"),
        "requested_date": trip_data.get("requested_date"),
        "requested_time": trip_data.get("requested_time"),
        "day_of_week": trip_data.get("day_of_week"),
        "hour_of_day": trip_data.get("hour_of_day"),
        "time_bucket": trip_data.get("time_bucket"),
        "distance_km": trip_data.get("distance_km"),
        "duration_minutes": trip_data.get("duration_minutes"),
        "trip_leg_count": trip_data.get("trip_leg_count", 0),
        "is_pool_type": trip_data.get("is_pool_type", False),
        "is_surge": trip_data.get("is_surge", False),
        "pickup_address": trip_data.get("pickup_address"),
        "dropoff_address": trip_data.get("dropoff_address"),
        "pickup_lat": trip_data.get("pickup_lat"),
        "pickup_lng": trip_data.get("pickup_lng"),
        "dropoff_lat": trip_data.get("dropoff_lat"),
        "dropoff_lng": trip_data.get("dropoff_lng"),
        "gross_amount": trip_data.get("gross_amount"),
        "extra_attributes": trip_data.get("extra_attributes", {}),
    }

    uber_trip, created = UberTrip.objects.update_or_create(
        uuid=uuid_value,
        defaults=defaults,
    )

    return uber_trip, created