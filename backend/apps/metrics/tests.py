from decimal import Decimal
from datetime import date, datetime, timezone
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from apps.metrics.models import OperatingCost, UberTrip
from apps.metrics.services.dashboard_metrics import (
    get_daily_breakdown,
    get_service_breakdown,
    get_summary_metrics,
    get_time_bucket_breakdown,
)
from apps.metrics.services.cost_metrics import get_cost_dashboard
from apps.metrics.services.trip_extractor import extract_basic_trip_data
from apps.payloads.models import RawPayload


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


class DashboardMetricsServiceTests(TestCase):
    def setUp(self):
        self._create_trip(
            payload_uuid="payload-1",
            trip_uuid="trip-1",
            service_group="mobility",
            service_type="Uber X",
            time_bucket="mañana",
            requested_date=date(2024, 4, 9),
            gross_amount=Decimal("100.00"),
            distance_km=Decimal("10.50"),
            duration_minutes=Decimal("20.00"),
            is_completed=True,
            is_canceled=False,
        )
        self._create_trip(
            payload_uuid="payload-2",
            trip_uuid="trip-2",
            service_group="delivery",
            service_type="Uber Delivery",
            time_bucket="noche",
            requested_date=date(2024, 4, 10),
            gross_amount=Decimal("80.00"),
            distance_km=Decimal("5.00"),
            duration_minutes=Decimal("35.00"),
            is_completed=False,
            is_canceled=True,
        )

    def _create_trip(
        self,
        *,
        payload_uuid,
        trip_uuid,
        service_group,
        service_type,
        time_bucket,
        requested_date,
        gross_amount,
        distance_km,
        duration_minutes,
        is_completed,
        is_canceled,
    ):
        raw_payload = RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid=payload_uuid,
            raw_data={"uuid": payload_uuid, "payload": {"data": {}}},
        )
        return UberTrip.objects.create(
            raw_payload=raw_payload,
            uuid=trip_uuid,
            service_group=service_group,
            service_type=service_type,
            status_type="COMPLETED" if is_completed else "CANCELED",
            is_completed=is_completed,
            is_canceled=is_canceled,
            requested_at=datetime(
                requested_date.year,
                requested_date.month,
                requested_date.day,
                12,
                0,
                tzinfo=timezone.utc,
            ),
            requested_date=requested_date,
            time_bucket=time_bucket,
            gross_amount=gross_amount,
            distance_km=distance_km,
            duration_minutes=duration_minutes,
        )

    def test_get_summary_metrics_returns_expected_totals(self):
        summary = get_summary_metrics()

        self.assertEqual(summary["total_trips"], 2)
        self.assertEqual(summary["completed_trips"], 1)
        self.assertEqual(summary["canceled_trips"], 1)
        self.assertEqual(summary["total_gross_amount"], Decimal("180"))
        self.assertEqual(summary["average_gross_amount"], Decimal("90"))
        self.assertEqual(summary["total_distance_km"], Decimal("15.5"))
        self.assertEqual(summary["average_duration_minutes"], Decimal("27.5"))
        self.assertEqual(summary["completion_rate"], Decimal("50.00"))
        self.assertEqual(summary["cancellation_rate"], Decimal("50.00"))
        self.assertEqual(summary["gross_per_trip"], Decimal("90.00"))
        self.assertEqual(summary["gross_per_km"], Decimal("11.61"))
        self.assertEqual(summary["gross_per_hour"], Decimal("196.36"))
        self.assertEqual(summary["filters"]["start_date"], None)

    def test_get_service_breakdown_groups_by_service(self):
        breakdown = get_service_breakdown()

        self.assertEqual(len(breakdown), 2)
        self.assertEqual(breakdown[0]["service_type"], "Uber X")
        self.assertEqual(breakdown[0]["trips_count"], 1)
        self.assertEqual(breakdown[0]["gross_amount_total"], Decimal("100"))
        self.assertEqual(breakdown[1]["service_group"], "delivery")

    def test_get_time_bucket_breakdown_respects_logical_order(self):
        breakdown = get_time_bucket_breakdown()

        self.assertEqual([row["time_bucket"] for row in breakdown], ["mañana", "noche"])
        self.assertEqual(breakdown[0]["gross_amount_total"], Decimal("100"))
        self.assertEqual(breakdown[1]["canceled_trips"], 1)

    def test_get_daily_breakdown_groups_by_requested_date(self):
        breakdown = get_daily_breakdown()

        self.assertEqual(len(breakdown), 2)
        self.assertEqual(breakdown[0]["requested_date"], date(2024, 4, 9))
        self.assertEqual(breakdown[0]["trips_count"], 1)
        self.assertEqual(breakdown[1]["requested_date"], date(2024, 4, 10))
        self.assertEqual(breakdown[1]["gross_amount_total"], Decimal("80"))

    def test_cost_dashboard_returns_financial_summary(self):
        OperatingCost.objects.create(
            category="fuel",
            title="Gasolina semana 1",
            amount=Decimal("60.00"),
            cost_date=date(2024, 4, 9),
        )
        OperatingCost.objects.create(
            category="tolls",
            title="Peajes semana 1",
            amount=Decimal("30.00"),
            cost_date=date(2024, 4, 10),
        )

        summary = get_cost_dashboard()

        self.assertEqual(summary["period_income"], Decimal("180.00"))
        self.assertEqual(summary["period_cost"], Decimal("90.00"))
        self.assertEqual(summary["period_utility"], Decimal("90.00"))
        self.assertEqual(summary["adjusted_roi"], Decimal("100.00"))
        self.assertEqual(summary["cost_entries_count"], 2)
        self.assertEqual(summary["cost_category_counts"][0]["category"], "fuel")
        self.assertEqual(summary["cost_category_counts"][0]["entries_count"], 1)
        self.assertEqual(len(summary["top_combos"]), 2)
        self.assertIsNotNone(summary["best_combo"])
        self.assertIsNotNone(summary["worst_combo"])


class DashboardMetricsApiTests(APITestCase):
    def setUp(self):
        self._create_trip(
            payload_uuid="payload-1",
            trip_uuid="trip-1",
            service_group="mobility",
            service_type="Uber X",
            time_bucket="mañana",
            requested_date=date(2024, 4, 9),
            gross_amount=Decimal("100.00"),
            distance_km=Decimal("10.50"),
            duration_minutes=Decimal("20.00"),
            is_completed=True,
            is_canceled=False,
        )
        self._create_trip(
            payload_uuid="payload-2",
            trip_uuid="trip-2",
            service_group="delivery",
            service_type="Uber Delivery",
            time_bucket="noche",
            requested_date=date(2024, 4, 10),
            gross_amount=Decimal("80.00"),
            distance_km=Decimal("5.00"),
            duration_minutes=Decimal("35.00"),
            is_completed=False,
            is_canceled=True,
        )

    def _create_trip(
        self,
        *,
        payload_uuid,
        trip_uuid,
        service_group,
        service_type,
        time_bucket,
        requested_date,
        gross_amount,
        distance_km,
        duration_minutes,
        is_completed,
        is_canceled,
    ):
        raw_payload = RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid=payload_uuid,
            raw_data={"uuid": payload_uuid, "payload": {"data": {}}},
        )
        return UberTrip.objects.create(
            raw_payload=raw_payload,
            uuid=trip_uuid,
            service_group=service_group,
            service_type=service_type,
            status_type="COMPLETED" if is_completed else "CANCELED",
            is_completed=is_completed,
            is_canceled=is_canceled,
            requested_at=datetime(
                requested_date.year,
                requested_date.month,
                requested_date.day,
                12,
                0,
                tzinfo=timezone.utc,
            ),
            requested_date=requested_date,
            time_bucket=time_bucket,
            gross_amount=gross_amount,
            distance_km=distance_km,
            duration_minutes=duration_minutes,
        )

    def test_summary_endpoint_supports_date_filters(self):
        response = self.client.get(
            "/api/metrics/summary/",
            {"start_date": "2024-04-10", "end_date": "2024-04-10"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_trips"], 1)
        self.assertEqual(response.data["canceled_trips"], 1)
        self.assertEqual(response.data["total_gross_amount"], Decimal("80"))
        self.assertEqual(response.data["gross_per_trip"], Decimal("80.00"))
        self.assertEqual(response.data["filters"]["start_date"], "2024-04-10")

    def test_by_day_endpoint_returns_daily_rows(self):
        response = self.client.get("/api/metrics/by-day/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(str(response.data[0]["requested_date"]), "2024-04-09")
        self.assertEqual(response.data[1]["gross_amount_total"], Decimal("80"))

    def test_by_service_endpoint_returns_grouped_rows(self):
        response = self.client.get("/api/metrics/by-service/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["service_type"], "Uber X")
        self.assertEqual(response.data[1]["service_group"], "delivery")

    def test_trips_endpoint_returns_normalized_trip_rows(self):
        response = self.client.get("/api/metrics/trips/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["uuid"], "trip-2")
        self.assertEqual(response.data[1]["status"], "completed")

    def test_map_points_endpoint_returns_only_trips_with_coordinates(self):
        trip_with_coords = UberTrip.objects.get(uuid="trip-1")
        trip_with_coords.pickup_lat = Decimal("19.432608")
        trip_with_coords.pickup_lng = Decimal("-99.133209")
        trip_with_coords.dropoff_lat = Decimal("19.427025")
        trip_with_coords.dropoff_lng = Decimal("-99.167665")
        trip_with_coords.pickup_address = "Origen"
        trip_with_coords.dropoff_address = "Destino"
        trip_with_coords.save()

        response = self.client.get("/api/metrics/map-points/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], "trip-1")
        self.assertEqual(response.data[0]["pickup_address"], "Origen")
        self.assertEqual(response.data[0]["dropoff_address"], "Destino")

    def test_map_points_endpoint_supports_date_filters(self):
        trip_with_coords = UberTrip.objects.get(uuid="trip-2")
        trip_with_coords.pickup_lat = Decimal("19.400000")
        trip_with_coords.pickup_lng = Decimal("-99.100000")
        trip_with_coords.dropoff_lat = Decimal("19.410000")
        trip_with_coords.dropoff_lng = Decimal("-99.110000")
        trip_with_coords.save()

        response = self.client.get(
            "/api/metrics/map-points/",
            {"start_date": "2024-04-10", "end_date": "2024-04-10"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], "trip-2")

    def test_invalid_date_returns_400(self):
        response = self.client.get("/api/metrics/summary/", {"start_date": "2024/04/10"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("YYYY-MM-DD", response.data["error"])

    def test_cost_entries_endpoint_creates_and_lists_entries(self):
        create_response = self.client.post(
            "/api/metrics/cost-entries/",
            {
                "category": "fuel",
                "title": "Gasolina abril",
                "description": "Carga completa",
                "amount": "450.50",
                "cost_date": "2024-04-10",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)

        list_response = self.client.get("/api/metrics/cost-entries/")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["category"], "fuel")

    def test_cost_dashboard_endpoint_returns_combo_analysis(self):
        OperatingCost.objects.create(
            category="maintenance",
            title="Servicio preventivo",
            amount=Decimal("90.00"),
            cost_date=date(2024, 4, 10),
        )

        response = self.client.get("/api/metrics/cost-dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["period_income"], Decimal("180"))
        self.assertEqual(response.data["period_cost"], Decimal("90"))
        self.assertEqual(response.data["cost_entries_count"], 1)
        self.assertEqual(response.data["cost_category_counts"][0]["category"], "maintenance")
        self.assertEqual(response.data["cost_category_counts"][0]["entries_count"], 1)
        self.assertEqual(len(response.data["top_combos"]), 2)
        self.assertIn("display_name", response.data["top_combos"][0])

    def test_cost_dashboard_endpoint_respects_date_filters(self):
        self._create_trip(
            payload_uuid="payload-3",
            trip_uuid="trip-3",
            service_group="mobility",
            service_type="Uber Planet",
            time_bucket="tarde",
            requested_date=date(2024, 5, 2),
            gross_amount=Decimal("60.00"),
            distance_km=Decimal("6.00"),
            duration_minutes=Decimal("18.00"),
            is_completed=True,
            is_canceled=False,
        )
        OperatingCost.objects.create(
            category="fuel",
            title="Gasolina abril",
            amount=Decimal("40.00"),
            cost_date=date(2024, 4, 10),
        )
        OperatingCost.objects.create(
            category="tolls",
            title="Peajes mayo",
            amount=Decimal("15.00"),
            cost_date=date(2024, 5, 2),
        )

        response = self.client.get(
            "/api/metrics/cost-dashboard/",
            {"start_date": "2024-05-01", "end_date": "2024-05-31"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["period_income"], Decimal("60"))
        self.assertEqual(response.data["period_cost"], Decimal("15"))
        self.assertEqual(response.data["cost_entries_count"], 1)
        self.assertEqual(response.data["cost_category_counts"][0]["category"], "tolls")
        self.assertEqual(response.data["filters"]["start_date"], "2024-05-01")
        self.assertEqual(response.data["filters"]["end_date"], "2024-05-31")

    def test_cost_csv_upload_endpoint_imports_rows(self):
        csv_bytes = (
            "fecha,concepto,monto,medio\n"
            "09/02/2026,gasolina,500,tarjeta\n"
            "12/03/2026,impuestos,536,transferencia\n"
        ).encode("utf-8")

        response = self.client.post(
            "/api/metrics/cost-entries/upload-csv/",
            {"file": SimpleUploadedFile("costos.csv", csv_bytes, content_type="text/csv")},
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["summary"]["created"], 2)
        self.assertEqual(response.data["summary"]["failed"], 0)
        self.assertEqual(OperatingCost.objects.count(), 2)
        self.assertEqual(OperatingCost.objects.order_by("cost_date").first().category, "fuel")
