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
