from rest_framework import serializers
from .models import RawPayload


def infer_detail_external_uuid(raw_data):
    if not isinstance(raw_data, dict):
        return None

    direct_uuid = raw_data.get("uuid")
    if isinstance(direct_uuid, str) and direct_uuid.strip():
        return direct_uuid.strip()

    payload_data = raw_data.get("payload")
    if isinstance(payload_data, dict):
        metadata = ((payload_data.get("data") or {}).get("metadata") or {})
        metadata_uuid = metadata.get("uuid")
        if isinstance(metadata_uuid, str) and metadata_uuid.strip():
            return metadata_uuid.strip()

    data = raw_data.get("data") or {}
    metadata = data.get("metadata") or {}
    metadata_uuid = metadata.get("uuid")
    if isinstance(metadata_uuid, str) and metadata_uuid.strip():
        return metadata_uuid.strip()

    return None


def save_raw_payload(payload_type, source_name, external_uuid, raw_data):
    resolved_external_uuid = external_uuid or infer_detail_external_uuid(raw_data)

    if (
        payload_type == RawPayload.PayloadType.DETAIL
        and resolved_external_uuid
    ):
        existing_payload = RawPayload.objects.filter(
            payload_type=payload_type,
            external_uuid=resolved_external_uuid,
        ).first()

        if existing_payload:
            existing_payload.source_name = source_name
            existing_payload.raw_data = raw_data
            existing_payload.ingestion_status = RawPayload.IngestionStatus.SAVED
            existing_payload.ingestion_error = None
            existing_payload.processing_error = None
            existing_payload.processing_status = RawPayload.ProcessingStatus.PENDING
            existing_payload.save(
                update_fields=[
                    "source_name",
                    "raw_data",
                    "ingestion_status",
                    "ingestion_error",
                    "processing_error",
                    "processing_status",
                    "updated_at",
                ]
            )
            return existing_payload, False

    payload = RawPayload.objects.create(
        payload_type=payload_type,
        source_name=source_name,
        external_uuid=resolved_external_uuid,
        raw_data=raw_data,
        ingestion_status=RawPayload.IngestionStatus.SAVED,
        processing_status=RawPayload.ProcessingStatus.PENDING,
        processing_attempts=0,
    )
    return payload, True


class RawPayloadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawPayload
        fields = (
            "id",
            "payload_type",
            "source_name",
            "external_uuid",
            "raw_data",
            "ingestion_status",
            "processing_status",
            "processing_attempts",
            "uploaded_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "ingestion_status",
            "processing_status",
            "processing_attempts",
            "uploaded_at",
            "created_at",
            "updated_at",
        )

    def validate_raw_data(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError(
                "raw_data debe ser un objeto JSON o una lista JSON."
            )
        return value

    def create(self, validated_data):
        payload, _created = save_raw_payload(
            payload_type=validated_data["payload_type"],
            source_name=validated_data.get("source_name"),
            external_uuid=validated_data.get("external_uuid"),
            raw_data=validated_data["raw_data"],
        )
        return payload


class RawPayloadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawPayload
        fields = (
            "id",
            "payload_type",
            "source_name",
            "external_uuid",
            "ingestion_status",
            "processing_status",
            "processing_attempts",
            "uploaded_at",
            "last_processed_at",
        )


class BulkPayloadItemSerializer(serializers.Serializer):
    external_uuid = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    raw_data = serializers.JSONField()

    def validate_raw_data(self, value):
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError(
                "raw_data debe ser un objeto JSON o una lista JSON."
            )
        return value


class RawPayloadBulkCreateSerializer(serializers.Serializer):
    payload_type = serializers.ChoiceField(choices=RawPayload.PayloadType.choices)
    source_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    items = BulkPayloadItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Debes enviar al menos un item en 'items'.")
        return value
