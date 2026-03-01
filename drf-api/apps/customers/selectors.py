from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from apps.customers.models import Address, Customer

User = get_user_model()


class AddressSelector:
    """
    Selector class for address queries.
    """

    @staticmethod
    def get_user_addresses(*, user) -> QuerySet[Address]:
        """
        Get all addresses for a user.
        """
        return Address.objects.filter(customer=user).order_by("-is_default", "-created_at")

    @staticmethod
    def get_address_by_id(*, address_id: int, user=None) -> Optional[Address]:
        """
        Get address by ID, optionally filtered by user.
        """
        try:
            filters = {"id": address_id}
            if user:
                filters["user"] = user

            return Address.objects.get(**filters)
        except Address.DoesNotExist:
            return None

    @staticmethod
    def get_default_address(*, user) -> Optional[Address]:
        """
        Get user's default address.
        """
        return Address.objects.filter(customer=user, is_default=True).first()

    @staticmethod
    def get_addresses_by_pincode(*, pincode: str) -> QuerySet[Address]:
        """
        Get all addresses in a specific pincode.
        """
        return Address.objects.filter(pincode=pincode)


class CustomerSelector:
    """
    Selector class for customer queries.
    """

    @staticmethod
    def get_customer_by_user(*, user) -> Optional[Customer]:
        """
        Get customer profile by user.
        """
        try:
            return Customer.objects.select_related("user").get(user=user)
        except Customer.DoesNotExist:
            return None

    @staticmethod
    def get_customer_by_id(*, customer_id: int) -> Optional[Customer]:
        """
        Get customer by ID.
        """
        try:
            return Customer.objects.select_related("user").get(id=customer_id)
        except Customer.DoesNotExist:
            return None
