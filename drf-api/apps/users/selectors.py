from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import Q, QuerySet

User = get_user_model()


class UserSelector:
    """
    Selector class for user queries.
    """

    @staticmethod
    def get_user_by_id(*, user_id: str) -> Optional[User]:
        """
        Get user by ID.
        """
        try:
            return User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_by_email(*, email: str) -> Optional[User]:
        """
        Get user by email.
        """
        try:
            return User.objects.get(email=email.lower(), is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_by_phone(*, phone: str) -> Optional[User]:
        """
        Get user by phone number.
        """
        try:
            return User.objects.get(phone=phone, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def user_exists(*, email: str = None, phone: str = None) -> bool:  # type: ignore
        """
        Check if user exists with given email or phone.
        """
        query = Q()

        if email:
            query |= Q(email=email.lower())
        if phone:
            query |= Q(phone=phone)

        return User.objects.filter(query).exists()

    @staticmethod
    def get_all_customers(*, is_active: bool = True) -> QuerySet[User]:
        """
        Get all customer users.
        """
        filters = {
            "role": User.UserRoles.CUSTOMER,
        }

        if is_active is not None:
            filters["is_active"] = is_active

        return User.objects.filter(**filters).select_related("customer_profile")

    @staticmethod
    def get_all_vendors(*, is_active: bool = True) -> QuerySet[User]:
        """
        Get all vendor users.
        """
        filters = {
            "role": User.UserRoles.VENDOR,
        }

        if is_active is not None:
            filters["is_active"] = is_active

        return User.objects.filter(**filters).select_related("vendor_profile")

    @staticmethod
    def search_users(*, query: str, role: str = None) -> QuerySet[User]:  # type: ignore
        """
        Search users by name, email, or phone.
        """
        filters = Q(
            Q(full_name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query)
        )

        if role:
            filters &= Q(role=role)

        return User.objects.filter(filters)
