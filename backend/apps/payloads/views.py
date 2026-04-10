from django.db import IntegrityError
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.metrics.models import UberTrip

from .models import RawPayload
from .serializers import (
    RawPayloadCreateSerializer,
    RawPayloadListSerializer,
    RawPayloadBulkCreateSerializer,
    save_raw_payload,
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
        updated_count = 0
        duplicate_count = 0
        failed_count = 0

        created_items = []
        updated_items = []
        duplicate_items = []
        failed_items = []

        for item in items:
            external_uuid = item.get("external_uuid")
            raw_data = item["raw_data"]

            try:
                payload, created = save_raw_payload(
                    payload_type=payload_type,
                    source_name=source_name,
                    external_uuid=external_uuid,
                    raw_data=raw_data,
                )

                if created:
                    created_count += 1
                    created_items.append(
                        {
                            "id": payload.id,
                            "external_uuid": payload.external_uuid,
                        }
                    )
                else:
                    updated_count += 1
                    updated_items.append(
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
                    "updated": updated_count,
                    "duplicates": duplicate_count,
                    "failed": failed_count,
                },
                "created_items": created_items,
                "updated_items": updated_items,
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

        processed_details_count = UberTrip.objects.count()
        processed_payload_count = detail_payloads.filter(
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
                    "processed_payload_count": processed_payload_count,
                },
                "pending_download_items": pending_download_items,
                "uploaded_pending_processing_items": uploaded_pending_processing_items,
            },
            status=status.HTTP_200_OK,
        )


class PayloadDetailLookupView(APIView):
    def get(self, request, *args, **kwargs):
        external_uuid = (request.query_params.get("external_uuid") or "").strip()

        if not external_uuid:
            return Response(
                {
                    "message": "Debes enviar el parámetro 'external_uuid'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = RawPayload.objects.filter(
            payload_type=RawPayload.PayloadType.DETAIL,
            external_uuid=external_uuid,
        ).first()

        if not payload:
            return Response(
                {
                    "external_uuid": external_uuid,
                    "found": False,
                    "current_step": "not_found",
                    "message": "No existe un detail con ese UUID en el sistema.",
                },
                status=status.HTTP_200_OK,
            )

        has_real_payload = has_real_detail_payload(payload.raw_data)

        if payload.processing_status == RawPayload.ProcessingStatus.PROCESSED:
            current_step = "step_4_processed"
        elif has_real_payload:
            current_step = "step_3_uploaded"
        else:
            current_step = "step_2_pending_download"

        return Response(
            {
                "external_uuid": external_uuid,
                "found": True,
                "current_step": current_step,
                "payload": {
                    "id": payload.id,
                    "source_name": payload.source_name,
                    "processing_status": payload.processing_status,
                    "processing_attempts": payload.processing_attempts,
                    "uploaded_at": payload.uploaded_at,
                    "last_processed_at": payload.last_processed_at,
                    "has_real_payload": has_real_payload,
                },
            },
            status=status.HTTP_200_OK,
        )
