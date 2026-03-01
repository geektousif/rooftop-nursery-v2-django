from django.contrib.auth import get_user_model
from django.db import transaction

from apps.customers.models import Address, Customer

User = get_user_model()


class AddressService:
    """
    Service class for address management.
    """

    @staticmethod
    @transaction.atomic
    def create_address(*, user, **data) -> Address:
        """
        Create a new address for user.
        """
        # If this is the first address, make it default
        if not user.addresses.exists():
            data["is_default"] = True

        address = Address.objects.create(user=user, **data)
        return address

    @staticmethod
    @transaction.atomic
    def update_address(*, address: Address, **data) -> Address:
        """
        Update an existing address.
        """
        for field, value in data.items():
            setattr(address, field, value)

        address.save()
        return address

    @staticmethod
    @transaction.atomic
    def set_default_address(*, address: Address) -> Address:
        """
        Set an address as default for the user.
        """
        # Remove default from other addresses
        Address.objects.filter(customer=address.customer, is_default=True).exclude(
            id=address.id
        ).update(is_default=False)

        # Set this address as default
        address.is_default = True
        address.save(update_fields=["is_default"])
        return address

    @staticmethod
    def delete_address(*, address: Address) -> bool:
        """
        Delete an address. If it was default, make another address default.
        """
        user = address.customer.user
        was_default = address.is_default

        address.delete()

        # If deleted address was default, make the first remaining address default
        if was_default:
            first_address = user.addresses.first()
            if first_address:
                first_address.is_default = True
                first_address.save(update_fields=["is_default"])

        return True


class CustomerService:
    """
    Service class for customer-specific operations.
    """

    @staticmethod
    def update_customer_profile(*, customer: Customer, **data) -> Customer:
        """
        Update customer profile data.
        """
        allowed_fields = ["gstin", "company_name", "preferred_language"]

        for field, value in data.items():
            if field in allowed_fields:
                setattr(customer, field, value)

        customer.save()
        return customer
