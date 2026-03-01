from rest_framework import serializers

from apps.users.serializers import UserSerializer

# from apps.users.serializers import UserListSerializer
from .models import Address, Customer


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address."""

    class Meta:
        model = Address
        fields = [
            "id",
            # "customer",
            "label",
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

    def validate_pincode(self, value):
        """Validate Indian pincode format."""
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Invalid pincode. Must be 6 digits.")
        return value


class CustomerProfileSerializer(serializers.ModelSerializer):
    """
    Customer profile with user data.
    """

    user = UserSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True, source="user.addresses")

    order_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "customer",
            "is_active",
            "is_guest",
            "addresses",
            "order_count",
            "addresses",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_order_count(self, obj):
        return obj.order_set.count()


# class CustomerListSerializer(serializers.ModelSerializer):
#     """Lightweight serializer for customer lists."""

#     user_email = serializers.CharField(source="user.email", read_only=True)
#     user_name = serializers.CharField(source="user.full_name", read_only=True)

#     class Meta:
#         model = Customer
#         fields = ["id", "user_email", "user_name", "is_active", "is_guest"]
