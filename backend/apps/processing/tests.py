from django.test import TestCase
from rest_framework.test import APITestCase

from apps.metrics.models import UberTrip
from apps.payloads.models import RawPayload
from apps.processing.models import ProcessRun
from apps.processing.services.detail_processor import process_pending_details


class DetailProcessingTests(TestCase):
    def test_process_pending_details_creates_uber_trip_for_real_payload(self):
        payload = RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="trip-123",
            raw_data={
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
                            "isSurge": False,
                            "formattedTotal": "$99.50",
                            "customRouteMap": "https://example.com/map?marker=lat:19.432608,lng:-99.133209&marker=lat:19.427025,lng:-99.167665",
                        },
                        "cards": [
                            {
                                "components": [
                                    {
                                        "type": "heroV2",
                                        "heroV2": {
                                            "text": "UberX",
                                            "vehicleType": "Uber X",
                                        },
                                    },
                                    {
                                        "type": "statTable",
                                        "statTable": {
                                            "stats": [
                                                {"label": "Duración", "value": "20 min"},
                                                {"label": "Distancia", "value": "10.50 km"},
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
            },
        )

        result = process_pending_details()

        payload.refresh_from_db()
        trip = UberTrip.objects.get(raw_payload=payload)
        process_run = ProcessRun.objects.get(id=result["process_run_id"])

        self.assertEqual(payload.processing_status, RawPayload.ProcessingStatus.PROCESSED)
        self.assertEqual(payload.processing_attempts, 1)
        self.assertEqual(trip.uuid, "trip-123")
        self.assertEqual(trip.service_group, "mobility")
        self.assertEqual(result["processed_records"], 1)
        self.assertEqual(result["failed_records"], 0)
        self.assertEqual(result["skipped_without_real_payload"], 0)
        self.assertEqual(process_run.status, ProcessRun.Status.COMPLETED)

    def test_process_pending_details_skips_placeholder_without_real_payload(self):
        payload = RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="placeholder-1",
            raw_data={"uuid": "placeholder-1", "payload": {}},
        )

        result = process_pending_details()

        payload.refresh_from_db()
        process_run = ProcessRun.objects.get(id=result["process_run_id"])

        self.assertEqual(payload.processing_status, RawPayload.ProcessingStatus.PENDING)
        self.assertEqual(payload.processing_attempts, 0)
        self.assertFalse(UberTrip.objects.exists())
        self.assertEqual(result["processed_records"], 0)
        self.assertEqual(result["failed_records"], 0)
        self.assertEqual(result["skipped_without_real_payload"], 1)
        self.assertEqual(process_run.status, ProcessRun.Status.COMPLETED)

    def test_process_pending_details_marks_failed_when_uuid_cannot_be_extracted(self):
        payload = RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="broken-1",
            raw_data={
                "data": {
                    "metadata": {
                        "statusType": "COMPLETED",
                    }
                }
            },
        )

        result = process_pending_details()

        payload.refresh_from_db()
        process_run = ProcessRun.objects.get(id=result["process_run_id"])

        self.assertEqual(payload.processing_status, RawPayload.ProcessingStatus.FAILED)
        self.assertEqual(payload.processing_attempts, 1)
        self.assertIn("uuid", payload.processing_error.lower())
        self.assertEqual(result["processed_records"], 0)
        self.assertEqual(result["failed_records"], 1)
        self.assertEqual(process_run.status, ProcessRun.Status.FAILED)


class ProcessRunsApiTests(APITestCase):
    def test_runs_endpoint_returns_recent_process_runs(self):
        ProcessRun.objects.create(
            process_type=ProcessRun.ProcessType.ACTIVITIES,
            status=ProcessRun.Status.COMPLETED,
            total_records=10,
            processed_records=10,
            failed_records=0,
        )
        ProcessRun.objects.create(
            process_type=ProcessRun.ProcessType.DETAILS,
            status=ProcessRun.Status.FAILED,
            total_records=4,
            processed_records=3,
            failed_records=1,
        )

        response = self.client.get("/api/processing/runs/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["process_type"], "details")
        self.assertEqual(response.data[1]["status"], "completed")
