from rest_framework import serializers
from apps.images.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage."""
    
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    
    class Meta:
        model = ProductImage
        fields = [
            'id',
            'variant',
            'variant_name',
            'product_name',
            'image_url',
            'image_provider_id',
            'is_display_image',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']