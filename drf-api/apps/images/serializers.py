from rest_framework import serializers

from apps.images.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    variant_id = serializers.CharField()

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "variant_id",
            "image_url",
            "thumbnail_url",
            "image_provider_id",
            "is_display_image",
        ]
        extra_kwargs = {"id": {"read_only": True}}
