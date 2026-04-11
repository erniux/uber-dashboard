from rest_framework import serializers

from apps.metrics.models import OperatingCost


class OperatingCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingCost
        fields = (
            "id",
            "category",
            "title",
            "description",
            "amount",
            "cost_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
