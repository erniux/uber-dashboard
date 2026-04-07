from rest_framework import serializers
from .models import RawPayload


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
        return RawPayload.objects.create(
            **validated_data,
            ingestion_status=RawPayload.IngestionStatus.SAVED,
            processing_status=RawPayload.ProcessingStatus.PENDING,
            processing_attempts=0,
        )


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