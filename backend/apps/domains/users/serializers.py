from auth_kit.serializers.user import UserSerializer as BaseUserSerializer
from rest_framework import serializers

from core.permissions import get_user_permissions

from .models import User


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists."""

    class Meta:
        model = User
        fields = ["id", "email", "phone", "full_name", "role"]


class UserRegisterSerializer(serializers.ModelSerializer):
    """User registration serializer"""

    password = serializers.CharField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"password": {"write_only": True, "required": True}}

    def validate(self, attrs):
        


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        fields = ["email", "password"]


class UserSerializer(BaseUserSerializer):
    """Full serializer for User."""

    full_name = serializers.CharField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    is_staff = serializers.BooleanField()
    email = serializers.EmailField()
    permissions = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = [
            "id",
            "email",
            "full_name",
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

    # def create(self, validated_data):
    #     password = validated_data.pop("password", None)
    #     user = User.objects.create(**validated_data)
    #     if password:
    #         user.set_password(password)
    #         user.save()
    #     return user

    # def update(self, instance, validated_data):
    #     password = validated_data.pop("password", None)
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     if password:
    #         instance.set_password(password)
    #     instance.save()
    #     return instance
