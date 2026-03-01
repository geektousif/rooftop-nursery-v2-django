"""
Customer selector functions following HackSoft Django style guide.

This module contains optimized database queries for customer data retrieval.
All functions return QuerySets or model instances with proper prefetching.
"""

from typing import Optional
from uuid import UUID

from django.db.models import Prefetch, Q, QuerySet

from .models import Address, Customer


def customer_get_all(
    *,
    is_active: Optional[bool] = None,
    is_guest: Optional[bool] = None,
    search: Optional[str] = None,
) -> QuerySet[Customer]:
    """
    Get all customers with optional filtering.

    Args:
        is_active: Filter by active status
        is_guest: Filter by guest status
        search: Search query for email, phone, or name

    Returns:
        QuerySet of Customer objects with optimized prefetching
    """
    qs = Customer.objects.all()

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    if is_guest is not None:
        qs = qs.filter(is_guest=is_guest)

    if search:
        qs = qs.filter(
            Q(user__email__icontains=search)
            | Q(user__phone__icontains=search)
            | Q(user__full_name__icontains=search)
        )

    return (
        qs.select_related("user")
        .prefetch_related(
            Prefetch(
                "address_set",
                queryset=Address.objects.order_by("-is_default", "-created_at"),
                to_attr="prefetched_addresses",
            )
        )
        .order_by("-created_at")
    )


def customer_get_by_id(*, customer_id: UUID) -> Customer:
    """
    Get a single customer by ID with full relations.

    Args:
        customer_id: Customer UUID

    Returns:
        Customer instance with all related data

    Raises:
        Customer.DoesNotExist: If customer not found
    """
    return (
        Customer.objects.select_related("user")
        .prefetch_related(
            Prefetch(
                "address_set",
                queryset=Address.objects.order_by("-is_default", "-created_at"),
                to_attr="prefetched_addresses",
            )
        )
        .get(id=customer_id)
    )


def customer_get_by_user(*, user_id: UUID) -> Customer:
    """
    Get a customer by user ID.

    Args:
        user_id: User UUID

    Returns:
        Customer instance

    Raises:
        Customer.DoesNotExist: If customer not found
    """
    return (
        Customer.objects.select_related("user")
        .prefetch_related(
            Prefetch(
                "address_set",
                queryset=Address.objects.order_by("-is_default", "-created_at"),
                to_attr="prefetched_addresses",
            )
        )
        .get(user_id=user_id)
    )


def customer_get_active(*, is_guest: Optional[bool] = None) -> QuerySet[Customer]:
    """
    Get all active customers.

    Args:
        is_guest: Filter by guest status (optional)

    Returns:
        QuerySet of active Customer objects
    """
    qs = Customer.objects.filter(is_active=True)

    if is_guest is not None:
        qs = qs.filter(is_guest=is_guest)

    return qs.select_related("user").prefetch_related("address_set").order_by("-created_at")


def customer_get_registered(*, is_active: Optional[bool] = True) -> QuerySet[Customer]:
    """
    Get all registered (non-guest) customers.

    Args:
        is_active: Filter by active status (default: True)

    Returns:
        QuerySet of registered Customer objects
    """
    qs = Customer.objects.filter(is_guest=False)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return qs.select_related("user").prefetch_related("address_set").order_by("-created_at")


def customer_get_guests(*, is_active: Optional[bool] = True) -> QuerySet[Customer]:
    """
    Get all guest customers.

    Args:
        is_active: Filter by active status (default: True)

    Returns:
        QuerySet of guest Customer objects
    """
    qs = Customer.objects.filter(is_guest=True)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return qs.select_related("user").order_by("-created_at")


def customer_search(*, query: str, is_guest: Optional[bool] = None) -> QuerySet[Customer]:
    """
    Search customers by email, phone, or name.

    Args:
        query: Search query string
        is_guest: Optional guest status filter

    Returns:
        QuerySet of Customer objects matching search query
    """
    qs = Customer.objects.filter(
        Q(user__email__icontains=query)
        | Q(user__phone__icontains=query)
        | Q(user__full_name__icontains=query)
    )

    if is_guest is not None:
        qs = qs.filter(is_guest=is_guest)

    return qs.select_related("user").prefetch_related("address_set").order_by("-created_at")


def customer_get_by_date_range(
    *, start_date, end_date, is_guest: Optional[bool] = None
) -> QuerySet[Customer]:
    """
    Get customers within a date range.

    Args:
        start_date: Start date for filtering
        end_date: End date for filtering
        is_guest: Optional guest status filter

    Returns:
        QuerySet of Customer objects within date range
    """
    qs = Customer.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

    if is_guest is not None:
        qs = qs.filter(is_guest=is_guest)

    return qs.select_related("user").order_by("-created_at")


def address_get_all(
    *,
    customer_id: Optional[UUID] = None,
    type: Optional[str] = None,
    is_default: Optional[bool] = None,
    pin_code: Optional[str] = None,
) -> QuerySet[Address]:
    """
    Get all addresses with optional filtering.

    Args:
        customer_id: Filter by customer UUID
        type: Filter by address type (shipping/billing)
        is_default: Filter by default status
        pin_code: Filter by PIN code

    Returns:
        QuerySet of Address objects with optimized prefetching
    """
    qs = Address.objects.all()

    if customer_id is not None:
        qs = qs.filter(customer_id=customer_id)

    if type is not None:
        qs = qs.filter(type=type)

    if is_default is not None:
        qs = qs.filter(is_default=is_default)

    if pin_code is not None:
        qs = qs.filter(pin_code__icontains=pin_code)

    return qs.select_related("customer", "customer__user").order_by("-is_default", "-created_at")


def address_get_by_id(*, address_id: UUID) -> Address:
    """
    Get a single address by ID with full relations.

    Args:
        address_id: Address UUID

    Returns:
        Address instance with all related data

    Raises:
        Address.DoesNotExist: If address not found
    """
    return Address.objects.select_related("customer", "customer__user").get(id=address_id)


def address_get_for_customer(
    *, customer_id: UUID, type: Optional[str] = None, is_default: Optional[bool] = None
) -> QuerySet[Address]:
    """
    Get addresses for a specific customer.

    Args:
        customer_id: Customer UUID
        type: Optional address type filter
        is_default: Optional default status filter

    Returns:
        QuerySet of Address objects for the customer
    """
    qs = Address.objects.filter(customer_id=customer_id)

    if type is not None:
        qs = qs.filter(type=type)

    if is_default is not None:
        qs = qs.filter(is_default=is_default)

    return qs.select_related("customer", "customer__user").order_by("-is_default", "-created_at")


def address_get_default(*, customer_id: UUID, type: str) -> Optional[Address]:
    """
    Get the default address of a specific type for a customer.

    Args:
        customer_id: Customer UUID
        type: Address type (shipping/billing)

    Returns:
        Address instance or None if not found
    """
    try:
        return Address.objects.get(
            customer_id=customer_id, type=type, is_default=True
        ).select_related("customer", "customer__user")
    except Address.DoesNotExist:
        return None


def address_search(*, query: str, customer_id: Optional[UUID] = None) -> QuerySet[Address]:
    """
    Search addresses by various fields.

    Args:
        query: Search query string
        customer_id: Optional customer UUID filter

    Returns:
        QuerySet of Address objects matching search query
    """
    qs = Address.objects.filter(
        Q(full_name__icontains=query)
        | Q(phone__icontains=query)
        | Q(email__icontains=query)
        | Q(address__icontains=query)
        | Q(city__icontains=query)
        | Q(state__icontains=query)
        | Q(pin_code__icontains=query)
    )

    if customer_id is not None:
        qs = qs.filter(customer_id=customer_id)

    return qs.select_related("customer", "customer__user").order_by("-is_default", "-created_at")
