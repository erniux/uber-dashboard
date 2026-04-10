from django.db import IntegrityError
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RawPayload
from .serializers import (
    RawPayloadCreateSerializer,
    RawPayloadListSerializer,
    RawPayloadBulkCreateSerializer,
)


def has_real_detail_payload(raw_data):
    if not isinstance(raw_data, dict):
        return False

    if "payload" in raw_data:
        payload = raw_data.get("payload")
        if payload is None:
            return False
        if isinstance(payload, dict):
            return len(payload) > 0
        if isinstance(payload, list):
            return len(payload) > 0
        return bool(payload)

    return len(raw_data) > 0


class RawPayloadCreateView(generics.CreateAPIView):
    queryset = RawPayload.objects.all()
    serializer_class = RawPayloadCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            payload = serializer.save()

            response_serializer = RawPayloadCreateSerializer(payload)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            return Response(
                {
                    "message": "No se pudo guardar el payload.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class RawPayloadListView(generics.ListAPIView):
    serializer_class = RawPayloadListSerializer

    def get_queryset(self):
        queryset = RawPayload.objects.all().order_by("-created_at")

        payload_type = self.request.query_params.get("payload_type")
        processing_status = self.request.query_params.get("processing_status")
        source_name_prefix = self.request.query_params.get("source_name_prefix")
        external_uuid = self.request.query_params.get("external_uuid")

        if payload_type:
            queryset = queryset.filter(payload_type=payload_type)

        if processing_status:
            queryset = queryset.filter(processing_status=processing_status)

        if source_name_prefix:
            queryset = queryset.filter(source_name__startswith=source_name_prefix)

        if external_uuid:
            queryset = queryset.filter(external_uuid=external_uuid)

        return queryset


class RawPayloadBulkCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RawPayloadBulkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload_type = serializer.validated_data["payload_type"]
        source_name = serializer.validated_data.get("source_name")
        items = serializer.validated_data["items"]

        created_count = 0
        duplicate_count = 0
        failed_count = 0

        created_items = []
        duplicate_items = []
        failed_items = []

        for item in items:
            external_uuid = item.get("external_uuid")
            raw_data = item["raw_data"]

            try:
                payload = RawPayload.objects.create(
                    payload_type=payload_type,
                    source_name=source_name,
                    external_uuid=external_uuid,
                    raw_data=raw_data,
                    ingestion_status=RawPayload.IngestionStatus.SAVED,
                    processing_status=RawPayload.ProcessingStatus.PENDING,
                    processing_attempts=0,
                )

                created_count += 1
                created_items.append(
                    {
                        "id": payload.id,
                        "external_uuid": payload.external_uuid,
                    }
                )

            except IntegrityError:
                duplicate_count += 1
                duplicate_items.append(
                    {
                        "external_uuid": external_uuid,
                        "message": "Registro duplicado para payload_type + external_uuid.",
                    }
                )

            except Exception as exc:
                failed_count += 1
                failed_items.append(
                    {
                        "external_uuid": external_uuid,
                        "error": str(exc),
                    }
                )

        return Response(
            {
                "message": "Carga masiva completada.",
                "summary": {
                    "total_received": len(items),
                    "created": created_count,
                    "duplicates": duplicate_count,
                    "failed": failed_count,
                },
                "created_items": created_items,
                "duplicate_items": duplicate_items,
                "failed_items": failed_items,
            },
            status=status.HTTP_201_CREATED,
        )


class PayloadWorkQueueView(APIView):
    def get(self, request, *args, **kwargs):
        detail_payloads = RawPayload.objects.filter(
            payload_type=RawPayload.PayloadType.DETAIL,
        ).order_by("-created_at")
        activity_payloads = RawPayload.objects.filter(
            payload_type=RawPayload.PayloadType.ACTIVITY,
        )

        pending_download_items = []
        uploaded_pending_processing_items = []

        for payload in detail_payloads:
            item = {
                "id": payload.id,
                "external_uuid": payload.external_uuid,
                "source_name": payload.source_name,
                "processing_status": payload.processing_status,
                "uploaded_at": payload.uploaded_at,
            }

            if not has_real_detail_payload(payload.raw_data):
                if payload.processing_status == RawPayload.ProcessingStatus.PENDING:
                    pending_download_items.append(item)
                continue

            if payload.processing_status == RawPayload.ProcessingStatus.PENDING:
                uploaded_pending_processing_items.append(item)

        processed_details_count = detail_payloads.filter(
            processing_status=RawPayload.ProcessingStatus.PROCESSED,
        ).count()

        return Response(
            {
                "summary": {
                    "pending_activity_count": activity_payloads.filter(
                        processing_status=RawPayload.ProcessingStatus.PENDING,
                    ).count(),
                    "pending_download_count": len(pending_download_items),
                    "uploaded_pending_processing_count": len(uploaded_pending_processing_items),
                    "processed_detail_count": processed_details_count,
                },
                "pending_download_items": pending_download_items,
                "uploaded_pending_processing_items": uploaded_pending_processing_items,
            },
            status=status.HTTP_200_OK,
        )
