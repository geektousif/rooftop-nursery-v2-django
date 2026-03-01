from rest_framework import serializers

from .models import WebhookEvents


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEvents."""

    class Meta:
        model = WebhookEvents
        fields = [
            "id",
            "event_type",
            "payload",
            "processed",
            "processing_error",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class WebhookEventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for webhook event lists."""

    class Meta:
        model = WebhookEvents
        fields = [
            "id",
            "event_type",
            "processed",
            "created_at",
        ]
