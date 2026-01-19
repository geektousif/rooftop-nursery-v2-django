from rest_framework import serializers
from apps.reviews.models import ProductReview
from apps.products.serializers import ProductListSerializer
from apps.customers.serializers import CustomerListSerializer


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer for ProductReview."""
    
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True, required=False)
    customer = CustomerListSerializer(read_only=True)
    customer_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = ProductReview
        fields = [
            'id',
            'product',
            'product_id',
            'customer',
            'customer_id',
            'reviewer_name',
            'rating',
            'comment',
            'body',
            'is_verified',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductReviewListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for review lists."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id',
            'product_name',
            'product_slug',
            'reviewer_name',
            'rating',
            'comment',
            'is_verified',
            'created_at',
        ]