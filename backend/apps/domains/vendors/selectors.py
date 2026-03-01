"""
Vendor selector functions following HackSoft Django style guide.

This module contains optimized database queries for vendor data retrieval.
All functions return QuerySets or model instances with proper prefetching.
"""

from typing import Optional
from uuid import UUID

from django.db import models
from django.db.models import Prefetch, Q, QuerySet

from .models import Vendor


def vendor_get_all(
    *,
    is_approved: Optional[bool] = None,
    is_active: Optional[bool] = None,
    is_platform_vendor: Optional[bool] = None,
    search: Optional[str] = None,
) -> QuerySet[Vendor]:
    """
    Get all vendors with optional filtering.

    Args:
        is_approved: Filter by approval status
        is_active: Filter by active status
        is_platform_vendor: Filter by platform vendor status
        search: Search query for business name, email, or user name

    Returns:
        QuerySet of Vendor objects with optimized prefetching
    """
    qs = Vendor.objects.all()

    if is_approved is not None:
        qs = qs.filter(is_approved=is_approved)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    if is_platform_vendor is not None:
        qs = qs.filter(is_platform_vendor=is_platform_vendor)

    if search:
        qs = qs.filter(
            Q(business_name__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__full_name__icontains=search)
        )

    return (
        qs.select_related("user")
        .prefetch_related(
            Prefetch(
                "product_set",
                queryset=Vendor.objects.prefetch_related("product_set"),
                to_attr="prefetched_products",
            )
        )
        .order_by("business_name")
    )


def vendor_get_by_id(*, vendor_id: UUID) -> Vendor:
    """
    Get a single vendor by ID with full relations.

    Args:
        vendor_id: Vendor UUID

    Returns:
        Vendor instance with all related data

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    return (
        Vendor.objects.select_related("user")
        .prefetch_related(
            Prefetch(
                "product_set",
                queryset=Vendor.objects.prefetch_related("product_set"),
                to_attr="prefetched_products",
            )
        )
        .get(id=vendor_id)
    )


def vendor_get_by_user(*, user_id: UUID) -> Vendor:
    """
    Get a vendor by user ID.

    Args:
        user_id: User UUID

    Returns:
        Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    return (
        Vendor.objects.select_related("user")
        .prefetch_related(
            Prefetch(
                "product_set",
                queryset=Vendor.objects.prefetch_related("product_set"),
                to_attr="prefetched_products",
            )
        )
        .get(user_id=user_id)
    )


def vendor_get_approved(*, is_active: Optional[bool] = True) -> QuerySet[Vendor]:
    """
    Get all approved vendors.

    Args:
        is_active: Filter by active status (default: True)

    Returns:
        QuerySet of approved Vendor objects
    """
    qs = Vendor.objects.filter(is_approved=True)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return qs.select_related("user").prefetch_related("product_set").order_by("business_name")


def vendor_get_pending_approval(*, limit: Optional[int] = None) -> QuerySet[Vendor]:
    """
    Get vendors pending approval.

    Args:
        limit: Optional limit for number of results

    Returns:
        QuerySet of pending Vendor objects
    """
    qs = (
        Vendor.objects.filter(is_approved=False, is_active=True)
        .select_related("user")
        .order_by("-created_at")
    )

    if limit is not None:
        qs = qs[:limit]

    return qs


def vendor_get_platform_vendors(*, is_active: Optional[bool] = True) -> QuerySet[Vendor]:
    """
    Get platform vendors.

    Args:
        is_active: Filter by active status (default: True)

    Returns:
        QuerySet of platform Vendor objects
    """
    qs = Vendor.objects.filter(is_platform_vendor=True)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return qs.select_related("user").order_by("business_name")


def vendor_search(*, query: str, is_approved: Optional[bool] = None) -> QuerySet[Vendor]:
    """
    Search vendors by business name, email, or user name.

    Args:
        query: Search query string
        is_approved: Optional approval status filter

    Returns:
        QuerySet of Vendor objects matching search query
    """
    qs = Vendor.objects.filter(
        Q(business_name__icontains=query)
        | Q(user__email__icontains=query)
        | Q(user__full_name__icontains=query)
    )

    if is_approved is not None:
        qs = qs.filter(is_approved=is_approved)

    return qs.select_related("user").prefetch_related("product_set").order_by("business_name")


def vendor_get_by_commission_range(
    *, min_rate: Optional[float] = None, max_rate: Optional[float] = None
) -> QuerySet[Vendor]:
    """
    Get vendors by commission rate range.

    Args:
        min_rate: Minimum commission rate
        max_rate: Maximum commission rate

    Returns:
        QuerySet of Vendor objects within commission range
    """
    qs = Vendor.objects.filter(is_approved=True)

    if min_rate is not None:
        qs = qs.filter(commission_rate__gte=min_rate)

    if max_rate is not None:
        qs = qs.filter(commission_rate__lte=max_rate)

    return qs.select_related("user").order_by("commission_rate")


def vendor_get_with_product_count(*, min_products: Optional[int] = None) -> QuerySet[Vendor]:
    """
    Get vendors with product count annotation.

    Args:
        min_products: Minimum number of products

    Returns:
        QuerySet of Vendor objects with product_count annotation
    """
    qs = Vendor.objects.filter(is_approved=True).annotate(product_count=models.Count("product"))

    if min_products is not None:
        qs = qs.filter(product_count__gte=min_products)

    return qs.select_related("user").order_by("-product_count")


def vendor_get_by_date_range(
    *, start_date, end_date, is_approved: Optional[bool] = None
) -> QuerySet[Vendor]:
    """
    Get vendors within a date range.

    Args:
        start_date: Start date for filtering
        end_date: End date for filtering
        is_approved: Optional approval status filter

    Returns:
        QuerySet of Vendor objects within date range
    """
    qs = Vendor.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

    if is_approved is not None:
        qs = qs.filter(is_approved=is_approved)

    return qs.select_related("user").order_by("-created_at")
