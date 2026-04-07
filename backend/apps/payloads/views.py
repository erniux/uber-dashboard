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
    queryset = RawPayload.objects.all().order_by("-created_at")
    serializer_class = RawPayloadListSerializer


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