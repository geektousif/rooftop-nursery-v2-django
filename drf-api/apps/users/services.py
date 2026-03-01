from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.customers.models import Customer

User = get_user_model()


class UserService:
    """
    Service class for user-related business logic.
    """

    @staticmethod
    @transaction.atomic
    def create_customer(*, email: str, phone: str, password: str, full_name: str) -> User:
        """
        Create a new customer user.
        """
        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "User with this email already exists."})

        if User.objects.filter(phone=phone).exists():
            raise ValidationError({"phone": "User with this phone number already exists."})

        # Create user
        user = User.objects.create_user(
            email=email,
            phone=phone,
            password=password,
            full_name=full_name,
            role=User.UserRoles.CUSTOMER,
        )  # type: ignore

        # Create customer profile
        Customer.objects.create(user=user)

        return user

    @staticmethod
    def update_user_profile(*, user: User, **data) -> User:
        """
        Update user profile data.
        """
        allowed_fields = ["full_name", "phone"]

        for field, value in data.items():
            if field in allowed_fields:
                setattr(user, field, value)

        user.save(update_fields=allowed_fields)
        return user

    @staticmethod
    def change_password(*, user: User, old_password: str, new_password: str) -> bool:
        """
        Change user password.
        """
        if not user.check_password(old_password):
            raise ValidationError({"old_password": "Current password is incorrect."})

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return True

    # @staticmethod
    # def verify_email(*, user: User) -> User:
    #     """
    #     Mark user email as verified.
    #     """
    #     user.is_email_verified = True
    #     user.save(update_fields=["is_email_verified"])
    #     return user

    # @staticmethod
    # def verify_phone(*, user: User) -> User:
    #     """
    #     Mark user phone as verified.
    #     """
    #     user.is_phone_verified = True
    #     user.save(update_fields=["is_phone_verified"])
    #     return user
