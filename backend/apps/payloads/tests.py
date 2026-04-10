from django.test import TestCase
from rest_framework.test import APITestCase

from apps.payloads.models import RawPayload


class PayloadWorkQueueTests(APITestCase):
    def test_work_queue_separates_pending_downloads_from_uploaded_details(self):
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.ACTIVITY,
            external_uuid="activity-1",
            raw_data={"uuid": "activity-1"},
            processing_status=RawPayload.ProcessingStatus.PENDING,
        )
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="detail-placeholder",
            source_name="generated_from_activity:activity-1",
            raw_data={"uuid": "detail-placeholder", "payload": {}},
            processing_status=RawPayload.ProcessingStatus.PENDING,
        )
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="detail-uploaded",
            source_name="detail-file.json",
            raw_data={"uuid": "detail-uploaded", "payload": {"data": {"metadata": {"uuid": "detail-uploaded"}}}},
            processing_status=RawPayload.ProcessingStatus.PENDING,
        )
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="detail-processed",
            source_name="detail-processed.json",
            raw_data={"uuid": "detail-processed", "payload": {"data": {"metadata": {"uuid": "detail-processed"}}}},
            processing_status=RawPayload.ProcessingStatus.PROCESSED,
        )

        response = self.client.get("/api/payloads/work-queue/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["summary"]["pending_activity_count"], 1)
        self.assertEqual(response.data["summary"]["pending_download_count"], 1)
        self.assertEqual(response.data["summary"]["uploaded_pending_processing_count"], 1)
        self.assertEqual(response.data["summary"]["processed_detail_count"], 1)
        self.assertEqual(response.data["pending_download_items"][0]["external_uuid"], "detail-placeholder")
        self.assertEqual(response.data["uploaded_pending_processing_items"][0]["external_uuid"], "detail-uploaded")

    def test_upload_detail_updates_existing_placeholder_instead_of_leaving_it_pending_download(self):
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="detail-1",
            source_name="generated_from_activity:activity-1",
            raw_data={"uuid": "detail-1", "payload": {}},
            processing_status=RawPayload.ProcessingStatus.PENDING,
        )

        upload_response = self.client.post(
            "/api/payloads/upload/",
            {
                "payload_type": "detail",
                "source_name": "detail-1.json",
                "raw_data": {
                    "payload": {
                        "data": {
                            "metadata": {
                                "uuid": "detail-1",
                            }
                        }
                    }
                },
            },
            format="json",
        )

        self.assertEqual(upload_response.status_code, 201)
        self.assertEqual(RawPayload.objects.filter(payload_type=RawPayload.PayloadType.DETAIL).count(), 1)

        detail_payload = RawPayload.objects.get(payload_type=RawPayload.PayloadType.DETAIL, external_uuid="detail-1")
        self.assertEqual(detail_payload.source_name, "detail-1.json")
        self.assertEqual(detail_payload.processing_status, RawPayload.ProcessingStatus.PENDING)
        self.assertNotEqual(detail_payload.raw_data, {"uuid": "detail-1", "payload": {}})

        queue_response = self.client.get("/api/payloads/work-queue/")
        self.assertEqual(queue_response.status_code, 200)
        self.assertEqual(queue_response.data["summary"]["pending_download_count"], 0)
        self.assertEqual(queue_response.data["summary"]["uploaded_pending_processing_count"], 1)

    def test_detail_lookup_returns_current_step_for_existing_detail(self):
        RawPayload.objects.create(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid="detail-lookup",
            source_name="detail-lookup.json",
            raw_data={"uuid": "detail-lookup", "payload": {"data": {"metadata": {"uuid": "detail-lookup"}}}},
            processing_status=RawPayload.ProcessingStatus.PENDING,
        )

        response = self.client.get("/api/payloads/detail-lookup/?external_uuid=detail-lookup")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["found"])
        self.assertEqual(response.data["current_step"], "step_3_uploaded")
        self.assertTrue(response.data["payload"]["has_real_payload"])

    def test_detail_lookup_returns_not_found_for_unknown_uuid(self):
        response = self.client.get("/api/payloads/detail-lookup/?external_uuid=missing-uuid")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["found"])
        self.assertEqual(response.data["current_step"], "not_found")
