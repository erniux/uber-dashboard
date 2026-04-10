from decimal import Decimal

from django.test import TestCase

from apps.metrics.services.trip_extractor import extract_basic_trip_data


class TripExtractorTests(TestCase):
    def test_extract_basic_trip_data_supports_wrapped_payload(self):
        raw_data = {
            "uuid": "trip-123",
            "payload": {
                "status": "success",
                "data": {
                    "metadata": {
                        "uuid": "trip-123",
                        "statusType": "COMPLETED",
                        "vehicleType": "Uber X",
                        "timeZone": "America/Mexico_City",
                        "requestedAt": 1712678400,
                        "tripLegCount": 1,
                        "isPoolType": False,
                        "isSurge": True,
                        "formattedTotal": "$129.33",
                        "customRouteMap": "https://example.com/map?marker=lat:19.432608,lng:-99.133209&marker=lat:19.427025,lng:-99.167665",
                    },
                    "cards": [
                        {
                            "components": [
                                {
                                    "type": "heroV2",
                                    "heroV2": {
                                        "text": "UberX",
                                        "dateRequested": "2024-04-09",
                                        "timeRequested": "08:00",
                                        "vehicleType": "Uber X",
                                    },
                                },
                                {
                                    "type": "statTable",
                                    "statTable": {
                                        "stats": [
                                            {"label": "Duración", "value": "1 h 35 min"},
                                            {"label": "Distancia", "value": "24.28 km"},
                                        ]
                                    },
                                },
                                {
                                    "type": "addressBlockV2",
                                    "addressBlockV2": {
                                        "addresses": [
                                            {"type": "PICKUP", "address": "Origen"},
                                            {"type": "DROPOFF", "address": "Destino"},
                                        ]
                                    },
                                },
                            ]
                        }
                    ],
                },
            },
        }

        trip_data = extract_basic_trip_data(raw_data)

        self.assertEqual(trip_data["uuid"], "trip-123")
        self.assertEqual(trip_data["service_group"], "mobility")
        self.assertEqual(trip_data["pickup_address"], "Origen")
        self.assertEqual(trip_data["dropoff_address"], "Destino")
        self.assertEqual(trip_data["distance_km"], Decimal("24.28"))
        self.assertEqual(trip_data["duration_minutes"], Decimal("95"))
        self.assertEqual(trip_data["gross_amount"], Decimal("129.33"))
        self.assertEqual(trip_data["pickup_lat"], Decimal("19.432608"))
        self.assertEqual(trip_data["dropoff_lng"], Decimal("-99.167665"))
