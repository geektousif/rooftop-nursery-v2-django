from rest_framework import serializers


class VendorListSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    business_name = serializers.CharField(read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    commission_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    approved_at = serializers.DateTimeField(read_only=True)
