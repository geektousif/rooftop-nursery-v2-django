from auth_kit.serializers.user import UserSerializer as BaseUserSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

from core.permissions import get_user_permissions

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Base user serializer - minimal data.
    """

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "full_name",
            "role",
            "is_staff",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "role",
            "is_staff",
            "created_at",
        ]


class UserTokenPayloadSerializer(BaseUserSerializer):
    """User -> for token payload"""

    full_name = serializers.CharField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    is_staff = serializers.BooleanField()
    email = serializers.EmailField()
    phone = PhoneNumberField()
    permissions = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "permissions",
        ]

    def get_permissions(self, obj):
        return get_user_permissions(obj)

    def get_full_name(self, obj):
        return obj.full_name

    def get_role_display(self, obj):
        return obj.role


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer.
    """

    password = serializers.CharField(
        write_only=True, min_length=8, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "email",
            "phone",
            "role",
            "full_name",
        ]
        extra_kwargs = {"password": {"write_only": True, "required": True}}

    def validate(self, attrs):
        if not attrs["role"] or attrs.get("role") not in [
            User.UserRoles.CUSTOMER,
            User.UserRoles.VENDOR,
        ]:
            attrs["role"] = User.UserRoles.CUSTOMER

        return attrs
