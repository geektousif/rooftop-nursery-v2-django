from rest_framework import serializers

from apps.users.models import User


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
        if attrs.get("role") not in [User.UserRoles.CUSTOMER, User.UserRoles.VENDOR]:
            attrs["role"] = User.UserRoles.CUSTOMER

        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        fields = ["email", "password"]


class UserSerializer(serializers.ModelSerializer):
    """Full serializer for User."""

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
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
