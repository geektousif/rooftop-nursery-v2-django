from rest_framework import serializers
from apps.vendors.models import Vendor
from apps.users.serializers import UserListSerializer


class VendorSerializer(serializers.ModelSerializer):
    """Full serializer for Vendor."""
    
    user = UserListSerializer(read_only=True)
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id',
            'user',
            'business_name',
            'commission_rate',
            'is_approved',
            'approved_at',
            'product_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    
    def get_product_count(self, obj):
        return obj.product_set.count()


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vendor lists."""
    
    class Meta:
        model = Vendor
        fields = ['id', 'business_name', 'is_approved']