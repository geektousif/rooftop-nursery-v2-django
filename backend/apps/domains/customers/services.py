"""
Customer service functions following HackSoft Django style guide.

This module contains business logic for customer management operations.
All functions use keyword-only arguments and return model instances.
"""
from typing import Optional
from uuid import UUID

from django.db import transaction

from apps.customers.models import Customer, Address
from apps.users.models import User
from core.exceptions import UnauthorizedAccessError


@transaction.atomic
def customer_create(
    *,
    user: User,
    is_guest: bool = False,
) -> Customer:
    """
    Create a new customer account.
    
    Args:
        user: User instance
        is_guest: Whether this is a guest customer
    
    Returns:
        Created Customer instance
    
    Raises:
        ValueError: If user already has a customer account
    """
    if hasattr(user, 'customer'):
        raise ValueError("User already has a customer account")
    
    customer = Customer.objects.create(
        user=user,
        is_guest=is_guest,
        is_active=True
    )
    
    return customer


@transaction.atomic
def customer_update(
    *,
    customer_id: UUID,
    is_active: Optional[bool] = None,
    is_guest: Optional[bool] = None,
) -> Customer:
    """
    Update customer details.
    
    Args:
        customer_id: Customer UUID
        is_active: New active status (optional)
        is_guest: New guest status (optional)
    
    Returns:
        Updated Customer instance
    
    Raises:
        Customer.DoesNotExist: If customer not found
    """
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        raise ValueError("Customer not found")
    
    if is_active is not None:
        customer.is_active = is_active
    
    if is_guest is not None:
        customer.is_guest = is_guest
    
    customer.save()
    return customer


@transaction.atomic
def customer_delete(*, customer_id: UUID) -> None:
    """
    Soft delete a customer account.
    
    Args:
        customer_id: Customer UUID
    
    Raises:
        Customer.DoesNotExist: If customer not found
    """
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        raise ValueError("Customer not found")
    
    customer.is_active = False
    customer.save()


@transaction.atomic
def address_create(
    *,
    customer: Customer,
    type: str,
    full_name: str,
    phone: str,
    address: str,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = "India",
    pin_code: str,
    email: Optional[str] = None,
    is_default: bool = False,
) -> Address:
    """
    Create a new address for a customer.
    
    Args:
        customer: Customer instance
        type: Address type (shipping/billing)
        full_name: Full name
        phone: Phone number
        address: Street address
        city: City (optional)
        state: State (optional)
        country: Country (default: India)
        pin_code: PIN code
        email: Email (optional)
        is_default: Whether this is the default address
    
    Returns:
        Created Address instance
    
    Raises:
        ValueError: If invalid address type
    """
    if type not in [Address.AddressType.SHIPPING, Address.AddressType.BILLING]:
        raise ValueError("Invalid address type")
    
    # If setting as default, unset other default addresses of same type
    if is_default:
        Address.objects.filter(customer=customer, type=type, is_default=True).update(is_default=False)
    
    address = Address.objects.create(
        customer=customer,
        type=type,
        full_name=full_name,
        phone=phone,
        address=address,
        city=city,
        state=state,
        country=country,
        pin_code=pin_code,
        email=email,
        is_default=is_default
    )
    
    return address


@transaction.atomic
def address_update(
    *,
    address_id: UUID,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    street_address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    pin_code: Optional[str] = None,
    email: Optional[str] = None,
    is_default: Optional[bool] = None,
) -> Address:
    """
    Update an address.
    
    Args:
        address_id: Address UUID
        full_name: New full name (optional)
        phone: New phone number (optional)
        street_address: New street address (optional)
        city: New city (optional)
        state: New state (optional)
        country: New country (optional)
        pin_code: New PIN code (optional)
        email: New email (optional)
        is_default: New default status (optional)
    
    Returns:
        Updated Address instance
    
    Raises:
        Address.DoesNotExist: If address not found
    """
    try:
        address = Address.objects.get(id=address_id)
    except Address.DoesNotExist:
        raise ValueError("Address not found")
    
    # If setting as default, unset other default addresses of same type
    if is_default is True and not address.is_default:
        Address.objects.filter(
            customer=address.customer, 
            type=address.type, 
            is_default=True
        ).update(is_default=False)
    
    if full_name is not None:
        address.full_name = full_name
    if phone is not None:
        address.phone = phone
    if street_address is not None:
        address.address = street_address
    if city is not None:
        address.city = city
    if state is not None:
        address.state = state
    if country is not None:
        address.country = country
    if pin_code is not None:
        address.pin_code = pin_code
    if email is not None:
        address.email = email
    if is_default is not None:
        address.is_default = is_default
    
    address.save()
    return address


@transaction.atomic
def address_delete(*, address_id: UUID) -> None:
    """
    Delete an address.
    
    Args:
        address_id: Address UUID
    
    Raises:
        Address.DoesNotExist: If address not found
    """
    try:
        address = Address.objects.get(id=address_id)
    except Address.DoesNotExist:
        raise ValueError("Address not found")
    
    address.delete()


@transaction.atomic
def address_set_default(*, address_id: UUID) -> Address:
    """
    Set an address as the default for its type.
    
    Args:
        address_id: Address UUID
    
    Returns:
        Updated Address instance
    
    Raises:
        Address.DoesNotExist: If address not found
    """
    try:
        address = Address.objects.get(id=address_id)
    except Address.DoesNotExist:
        raise ValueError("Address not found")
    
    # Unset other default addresses of same type
    Address.objects.filter(
        customer=address.customer, 
        type=address.type, 
        is_default=True
    ).update(is_default=False)
    
    # Set this as default
    address.is_default = True
    address.save()
    
    return address


def customer_get_or_create(*, user: User, is_guest: bool = False) -> Customer:
    """
    Get existing customer or create new one.
    
    Args:
        user: User instance
        is_guest: Whether this is a guest customer
    
    Returns:
        Customer instance
    """
    customer, created = Customer.objects.get_or_create(
        user=user,
        defaults={'is_guest': is_guest, 'is_active': True}
    )
    
    return customer


def guest_customer_create(*, email: str, phone: str, full_name: str) -> Customer:
    """
    Create a guest customer without user account.
    
    Args:
        email: Email address
        phone: Phone number
        full_name: Full name
    
    Returns:
        Created Customer instance
    """
    # Create a guest user first
    user = User.objects.create_user(
        email=email,
        phone=phone,
        full_name=full_name,
        is_active=False,  # Guest users are inactive
        is_guest=True
    )
    
    return customer_create(user=user, is_guest=True)