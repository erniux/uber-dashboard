from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import re
from urllib.parse import parse_qs, unquote, urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings


def find_component(cards, component_type):
    """
    Busca el primer componente por type dentro de data.cards[*].components[*]
    """
    for card in cards or []:
        for component in card.get("components", []):
            if component.get("type") == component_type:
                return component.get(component_type)
    return None


def parse_money(value):
    """
    Convierte strings como '$129.33' o '-$10.80' a Decimal.
    """
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return Decimal(str(value))

    if not isinstance(value, str):
        return None

    cleaned = value.strip()
    cleaned = cleaned.replace("$", "").replace(",", "").replace("\xa0", "").strip()

    if not cleaned:
        return None

    try:
        return Decimal(cleaned)
    except (InvalidOperation, ValueError):
        return None


def parse_distance_km(value):
    """
    Convierte strings como '24.28 km' a Decimal.
    """
    if not value or not isinstance(value, str):
        return None

    match = re.search(r"([\d.]+)\s*km", value.lower())
    if not match:
        return None

    try:
        return Decimal(match.group(1))
    except (InvalidOperation, ValueError):
        return None


def parse_duration_minutes(value):
    """
    Convierte textos como:
    '1 h 35 min'
    '21 min 12 seg'
    a minutos decimales.
    """
    if not value or not isinstance(value, str):
        return None

    text = value.lower().replace("\xa0", " ")

    hours = 0
    minutes = 0
    seconds = 0

    hour_match = re.search(r"(\d+)\s*h", text)
    minute_match = re.search(r"(\d+)\s*min", text)
    second_match = re.search(r"(\d+)\s*seg", text)

    if hour_match:
        hours = int(hour_match.group(1))
    if minute_match:
        minutes = int(minute_match.group(1))
    if second_match:
        seconds = int(second_match.group(1))

    total_minutes = Decimal(hours * 60 + minutes) + (Decimal(seconds) / Decimal("60"))
    return total_minutes


def resolve_timezone(timezone_name=None):
    candidate = timezone_name or settings.TIME_ZONE
    try:
        return ZoneInfo(candidate)
    except ZoneInfoNotFoundError:
        return ZoneInfo(settings.TIME_ZONE)


def parse_requested_at(timestamp_value, timezone_name=None):
    """
    Convierte unix timestamp a datetime aware en la zona horaria del payload.
    """
    if timestamp_value in (None, ""):
        return None

    try:
        utc_dt = datetime.fromtimestamp(timestamp_value, tz=timezone.utc)
        return utc_dt.astimezone(resolve_timezone(timezone_name))
    except (TypeError, ValueError, OSError):
        return None


def derive_time_bucket(hour):
    if hour is None:
        return None

    if 0 <= hour < 6:
        return "madrugada"
    if 6 <= hour < 12:
        return "mañana"
    if 12 <= hour < 18:
        return "tarde"
    return "noche"


def derive_service_group(service_type):
    """
    Clasificación general del servicio.
    """
    if not service_type:
        return "other"

    value = service_type.lower()

    if "delivery" in value or "entrega" in value:
        return "delivery"

    if "compra" in value or "shop" in value:
        return "shopping"

    if "uber x" in value or "uber" in value:
        return "mobility"

    return "other"


def extract_coordinates_from_map_url(map_url):
    """
    Extrae pickup/dropoff lat/lng desde customRouteMap.
    Devuelve:
    {
        "pickup_lat": ...,
        "pickup_lng": ...,
        "dropoff_lat": ...,
        "dropoff_lng": ...,
    }
    """
    result = {
        "pickup_lat": None,
        "pickup_lng": None,
        "dropoff_lat": None,
        "dropoff_lng": None,
    }

    if not map_url or not isinstance(map_url, str):
        return result

    parsed = urlparse(map_url)
    query = parse_qs(parsed.query)
    markers = query.get("marker", [])

    parsed_markers = []
    for marker in markers:
        decoded = unquote(marker)
        lat_match = re.search(r"lat:([-\d.]+)", decoded)
        lng_match = re.search(r"lng:([-\d.]+)", decoded)

        if lat_match and lng_match:
            parsed_markers.append(
                (
                    Decimal(lat_match.group(1)),
                    Decimal(lng_match.group(1)),
                )
            )

    if len(parsed_markers) >= 1:
        result["pickup_lat"] = parsed_markers[0][0]
        result["pickup_lng"] = parsed_markers[0][1]

    if len(parsed_markers) >= 2:
        result["dropoff_lat"] = parsed_markers[1][0]
        result["dropoff_lng"] = parsed_markers[1][1]

    return result

def extract_basic_trip_data(raw_data):
    """
    Extrae solo campos básicos del payload detail.
    Soporta dos formatos:

    Formato A:
    {
        "status": "success",
        "data": {...}
    }

    Formato B:
    {
        "uuid": "...",
        "payload": {
            "status": "success",
            "data": {...}
        }
    }

    No crea nada en DB todavía.
    """
    if not isinstance(raw_data, dict):
        return {}

    # Detectar si el payload real viene envuelto dentro de raw_data["payload"]
    payload_content = raw_data.get("payload")
    if isinstance(payload_content, dict) and payload_content.get("data"):
        source_data = payload_content
    else:
        source_data = raw_data

    data = source_data.get("data", {}) or {}
    cards = data.get("cards", []) or []
    metadata = data.get("metadata", {}) or {}

    hero = find_component(cards, "heroV2") or {}
    stat_table = find_component(cards, "statTable") or {}
    address_block = find_component(cards, "addressBlockV2") or {}

    stats = stat_table.get("stats", []) or []
    addresses = address_block.get("addresses", []) or []

    duration_value = None
    distance_value = None

    for stat in stats:
        label = (stat.get("label") or "").strip().lower()
        if "duración" in label:
            duration_value = stat.get("value")
        elif "distancia" in label:
            distance_value = stat.get("value")

    pickup_address = None
    dropoff_address = None

    for address_item in addresses:
        address_type = address_item.get("type")
        address_text = address_item.get("address")

        if address_type == "PICKUP":
            pickup_address = address_text
        elif address_type == "DROPOFF":
            dropoff_address = address_text

    requested_at = parse_requested_at(
        metadata.get("requestedAt"),
        metadata.get("timeZone"),
    )
    hour_of_day = requested_at.hour if requested_at else None
    service_type = metadata.get("vehicleType") or hero.get("vehicleType")

    coordinates = extract_coordinates_from_map_url(metadata.get("customRouteMap"))

    return {
        "uuid": metadata.get("uuid") or raw_data.get("uuid"),
        "status_type": metadata.get("statusType"),
        "is_completed": metadata.get("statusType") == "COMPLETED",
        "is_canceled": metadata.get("statusType") == "CANCELED",
        "service_type": service_type,
        "service_group": derive_service_group(service_type),
        "requested_at": requested_at,
        "timezone": metadata.get("timeZone"),
        "requested_date": requested_at.date() if requested_at else None,
        "requested_time": requested_at.time() if requested_at else None,
        "day_of_week": requested_at.strftime("%A") if requested_at else None,
        "hour_of_day": hour_of_day,
        "time_bucket": derive_time_bucket(hour_of_day),
        "distance_km": parse_distance_km(distance_value),
        "duration_minutes": parse_duration_minutes(duration_value),
        "trip_leg_count": metadata.get("tripLegCount") or 0,
        "is_pool_type": bool(metadata.get("isPoolType")),
        "is_surge": bool(metadata.get("isSurge")),
        "pickup_address": pickup_address,
        "dropoff_address": dropoff_address,
        "pickup_lat": coordinates["pickup_lat"],
        "pickup_lng": coordinates["pickup_lng"],
        "dropoff_lat": coordinates["dropoff_lat"],
        "dropoff_lng": coordinates["dropoff_lng"],
        "gross_amount": parse_money(metadata.get("formattedTotal")),
        "extra_attributes": {
            "hero_text": hero.get("text"),
            "hero_date_requested": hero.get("dateRequested"),
            "hero_time_requested": hero.get("timeRequested"),
        },
    }
