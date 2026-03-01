from rest_framework import serializers

from .models import Banner, StorefrontSetting


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner."""

    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "image_url",
            "mobile_image_url",
            "link_url",
            "position_type",
            "start_date",
            "end_date",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StorefrontSettingSerializer(serializers.ModelSerializer):
    """Serializer for StorefrontSetting."""

    class Meta:
        model = StorefrontSetting
        fields = [
            "id",
            "key",
            "value",
            "type",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
