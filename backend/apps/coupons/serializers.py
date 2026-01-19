from rest_framework import serializers
from apps.coupons.models import Coupon
from apps.products.serializers import ProductVariantListSerializer


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for Coupon."""
    
    applies_to_specific_products = ProductVariantListSerializer(many=True, read_only=True)
    product_variant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'min_order_amount',
            'max_discount_amount',
            'start_date',
            'end_date',
            'usage_limit',
            'usage_limit_per_user',
            'applies_to_all_products',
            'applies_to_specific_products',
            'product_variant_ids',
            'is_active',
            'is_valid',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Check if coupon is currently valid."""
        from django.utils import timezone
        now = timezone.now()
        return (
            obj.is_active and
            obj.start_date <= now <= obj.end_date
        )
    
    def create(self, validated_data):
        product_variant_ids = validated_data.pop('product_variant_ids', None)
        coupon = Coupon.objects.create(**validated_data)
        if product_variant_ids:
            coupon.applies_to_specific_products.set(product_variant_ids)
        return coupon
    
    def update(self, instance, validated_data):
        product_variant_ids = validated_data.pop('product_variant_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if product_variant_ids is not None:
            instance.applies_to_specific_products.set(product_variant_ids)
        return instance


class CouponListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for coupon lists."""
    
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'min_order_amount',
            'is_active',
            'is_valid',
        ]
    
    def get_is_valid(self, obj):
        from django.utils import timezone
        now = timezone.now()
        return (
            obj.is_active and
            obj.start_date <= now <= obj.end_date
        )