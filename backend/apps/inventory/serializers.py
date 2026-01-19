from rest_framework import serializers
from apps.inventory.models import Stock, InventoryLog
# from apps.products.serializers import ProductVariantListSerializer


class StockSerializer(serializers.ModelSerializer):
    """Serializer for Stock."""
    
    # variant = ProductVariantListSerializer(read_only=True)
    variant_id = serializers.UUIDField(write_only=True, required=False)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    
    class Meta:
        model = Stock
        fields = [
            'id',
            'variant',
            'variant_id',
            'product_name',
            'variant_name',
            'sku',
            'quantity',
            'reserved_quantity',
            'available_quantity',
            'low_stock_threshold',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'available_quantity', 'created_at', 'updated_at']


class InventoryLogSerializer(serializers.ModelSerializer):
    """Serializer for InventoryLog."""
    
    # variant = ProductVariantListSerializer(read_only=True)
    variant_id = serializers.UUIDField(write_only=True, required=False)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    
    class Meta:
        model = InventoryLog
        fields = [
            'id',
            'variant',
            'variant_id',
            'product_name',
            'variant_name',
            'change_quantity',
            'action_type',
            'reference_id',
            'reference_type',
            'previous_quantity',
            'current_quantity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'previous_quantity',
            'current_quantity',
            'created_at',
            'updated_at',
        ]