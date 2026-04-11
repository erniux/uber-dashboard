from decimal import Decimal

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


class PipelineFunctionalFlowTests(APITestCase):
    def _build_detail_payload(self, uuid_value):
        return {
            "uuid": uuid_value,
            "payload": {
                "status": "success",
                "data": {
                    "metadata": {
                        "uuid": uuid_value,
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
        }

    def test_end_to_end_activity_detail_processing_updates_queue_and_metrics(self):
        activity_uuid = "activity-100"
        detail_uuid = "detail-100"

        upload_activity_response = self.client.post(
            "/api/payloads/upload/",
            {
                "payload_type": "activity",
                "source_name": "activity-batch.json",
                "external_uuid": activity_uuid,
                "raw_data": {
                    "items": [
                        {"uuid": detail_uuid},
                        {"uuid": detail_uuid},
                    ]
                },
            },
            format="json",
        )
        self.assertEqual(upload_activity_response.status_code, 201)

        run_activities_response = self.client.post("/api/processing/activities/run/")
        self.assertEqual(run_activities_response.status_code, 200)
        self.assertEqual(run_activities_response.data["result"]["processed_records"], 1)
        self.assertEqual(run_activities_response.data["result"]["detail_created"], 1)
        self.assertEqual(run_activities_response.data["result"]["detail_skipped"], 0)

        activity_payload = RawPayload.objects.get(
            payload_type=RawPayload.PayloadType.ACTIVITY,
            external_uuid=activity_uuid,
        )
        detail_payload = RawPayload.objects.get(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid=detail_uuid,
        )

        self.assertEqual(activity_payload.processing_status, RawPayload.ProcessingStatus.PROCESSED)
        self.assertEqual(detail_payload.processing_status, RawPayload.ProcessingStatus.PENDING)

        queue_after_activities = self.client.get("/api/payloads/work-queue/")
        self.assertEqual(queue_after_activities.status_code, 200)
        self.assertEqual(queue_after_activities.data["summary"]["pending_download_count"], 1)
        self.assertEqual(queue_after_activities.data["summary"]["uploaded_pending_processing_count"], 0)
        self.assertEqual(queue_after_activities.data["pending_download_items"][0]["external_uuid"], detail_uuid)

        upload_detail_response = self.client.post(
            "/api/payloads/upload/",
            {
                "payload_type": "detail",
                "source_name": "detail-100.json",
                "raw_data": self._build_detail_payload(detail_uuid),
            },
            format="json",
        )
        self.assertEqual(upload_detail_response.status_code, 201)

        detail_payload.refresh_from_db()
        self.assertEqual(detail_payload.source_name, "detail-100.json")
        self.assertEqual(detail_payload.processing_status, RawPayload.ProcessingStatus.PENDING)

        queue_after_detail_upload = self.client.get("/api/payloads/work-queue/")
        self.assertEqual(queue_after_detail_upload.status_code, 200)
        self.assertEqual(queue_after_detail_upload.data["summary"]["pending_download_count"], 0)
        self.assertEqual(queue_after_detail_upload.data["summary"]["uploaded_pending_processing_count"], 1)
        self.assertEqual(queue_after_detail_upload.data["uploaded_pending_processing_items"][0]["external_uuid"], detail_uuid)

        run_details_response = self.client.post("/api/processing/details/run/")
        self.assertEqual(run_details_response.status_code, 200)
        self.assertEqual(run_details_response.data["result"]["processed_records"], 1)
        self.assertEqual(run_details_response.data["result"]["failed_records"], 0)

        detail_payload.refresh_from_db()
        trip = UberTrip.objects.get(uuid=detail_uuid)

        self.assertEqual(detail_payload.processing_status, RawPayload.ProcessingStatus.PROCESSED)
        self.assertEqual(detail_payload.processing_attempts, 1)
        self.assertEqual(trip.raw_payload_id, detail_payload.id)
        self.assertEqual(trip.gross_amount, Decimal("99.50"))

        queue_after_detail_processing = self.client.get("/api/payloads/work-queue/")
        self.assertEqual(queue_after_detail_processing.status_code, 200)
        self.assertEqual(queue_after_detail_processing.data["summary"]["uploaded_pending_processing_count"], 0)
        self.assertEqual(queue_after_detail_processing.data["summary"]["processed_detail_count"], 1)

        summary_response = self.client.get(
            "/api/metrics/summary/",
            {"start_date": "2024-04-09", "end_date": "2024-04-09"},
        )
        self.assertEqual(summary_response.status_code, 200)
        self.assertEqual(summary_response.data["total_trips"], 1)
        self.assertEqual(summary_response.data["completed_trips"], 1)
        self.assertEqual(summary_response.data["total_gross_amount"], Decimal("99.50"))

        trips_response = self.client.get(
            "/api/metrics/trips/",
            {"start_date": "2024-04-09", "end_date": "2024-04-09"},
        )
        self.assertEqual(trips_response.status_code, 200)
        self.assertEqual(len(trips_response.data), 1)
        self.assertEqual(trips_response.data[0]["uuid"], detail_uuid)

        runs_response = self.client.get("/api/processing/runs/")
        self.assertEqual(runs_response.status_code, 200)
        self.assertEqual(len(runs_response.data), 2)
        self.assertEqual(runs_response.data[0]["process_type"], "details")
        self.assertEqual(runs_response.data[1]["process_type"], "activities")
