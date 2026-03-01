from rest_framework import serializers

from ..models.product import Product


class ProductVariantSerializer(serializers.Serializer):
    """Variant data for create/update operations."""

    id = serializers.UUIDField(required=False, allow_null=True)
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sku = serializers.CharField(max_length=255)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock = serializers.IntegerField(min_value=0)
    description = serializers.CharField(required=False, allow_blank=True)

    unit = serializers.CharField(max_length=50, required=False, allow_blank=True)
    unit_value = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    weight_grams = serializers.IntegerField(required=False, allow_null=True)
    variant_attributes = serializers.JSONField(required=False, default=dict)
    description = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)

    # def validate_price(self, value):
    #     """Validate price is positive."""
    #     if value <= 0:
    #         raise serializers.ValidationError("Price must be greater than 0")
    #     return value

    def validate(self, attrs):
        """Cross-field validation."""
        mrp = attrs.get("mrp")
        price = attrs.get("price")

        if mrp and price and mrp < price:
            raise serializers.ValidationError("MRP cannot be less than price")

        return attrs


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class ProductWriteSerializer(serializers.Serializer):
    """Serializer for creating/updating products."""

    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    category_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    attributes = serializers.JSONField(required=False, default=dict)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), required=False, default=list
    )
    variants = ProductVariantSerializer(many=True, min_length=1)
    is_active = serializers.BooleanField(required=False, default=True)

    # For admin only
    vendor_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_variants(self, value):
        """Validate variants list."""
        if not value:
            raise serializers.ValidationError("At least one variant is required")

        # Check for duplicate SKUs
        skus = [v["sku"] for v in value]
        if len(skus) != len(set(skus)):
            raise serializers.ValidationError("Duplicate SKUs in variants")

        return value


class CreatedProductResponseSerializer(serializers.Serializer):
    product = ProductSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        fields = ["product", "variants"]
