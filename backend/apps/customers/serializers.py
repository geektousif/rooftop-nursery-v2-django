from rest_framework import serializers

from apps.customers.models import Address, Customer
from apps.users.serializers import UserListSerializer


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address."""

    class Meta:
        model = Address
        fields = [
            "id",
            "customer",
            "type",
            "full_name",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "country",
            "pin_code",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CustomerSerializer(serializers.ModelSerializer):
    """Full serializer for Customer."""

    user = UserListSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    order_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "user",
            "is_active",
            "is_guest",
            "addresses",
            "order_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_order_count(self, obj):
        return obj.order_set.count()


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for customer lists."""

    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "user_email", "user_name", "is_active", "is_guest"]
