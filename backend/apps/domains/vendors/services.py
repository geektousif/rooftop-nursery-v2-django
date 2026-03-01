"""
Vendor service functions following HackSoft Django style guide.

This module contains business logic for vendor management operations.
All functions use keyword-only arguments and return model instances.
"""

from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.db import transaction
from django.utils import timezone

from apps.domains.users.models import User
from core.exceptions import UnauthorizedAccessError, VendorNotApprovedError

from .models import Vendor


@transaction.atomic
def vendor_create(
    *,
    user: User,
    business_name: str,
    commission_rate: Optional[Decimal] = None,
    is_platform_vendor: bool = False,
    is_approved: bool = False,
) -> Vendor:
    """
    Create a new vendor account.

    Args:
        user: User instance
        business_name: Business name
        commission_rate: Commission rate (defaults to platform default)
        is_platform_vendor: Whether this is a platform vendor
        is_approved: Whether vendor is pre-approved

    Returns:
        Created Vendor instance

    Raises:
        ValueError: If user already has a vendor account
    """
    if hasattr(user, "vendor"):
        raise ValueError("User already has a vendor account")

    # Set default commission rate if not provided
    if commission_rate is None:
        commission_rate = Decimal("15.00")  # Default 15% commission

    # Auto-approve platform vendors
    if is_platform_vendor:
        is_approved = True

    vendor = Vendor.objects.create(
        user=user,
        business_name=business_name,
        commission_rate=commission_rate,
        is_platform_vendor=is_platform_vendor,
        is_approved=is_approved,
        approved_at=timezone.now() if is_approved else None,
    )

    return vendor


@transaction.atomic
def vendor_update(
    *,
    vendor_id: UUID,
    business_name: Optional[str] = None,
    commission_rate: Optional[Decimal] = None,
) -> Vendor:
    """
    Update vendor details.

    Args:
        vendor_id: Vendor UUID
        business_name: New business name (optional)
        commission_rate: New commission rate (optional)

    Returns:
        Updated Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    if business_name is not None:
        vendor.business_name = business_name

    if commission_rate is not None:
        vendor.commission_rate = commission_rate

    vendor.save()
    return vendor


@transaction.atomic
def vendor_approve(*, vendor_id: UUID) -> Vendor:
    """
    Approve a vendor account.

    Args:
        vendor_id: Vendor UUID

    Returns:
        Updated Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    if vendor.is_approved:
        return vendor  # Already approved

    vendor.is_approved = True
    vendor.approved_at = timezone.now()
    vendor.save()

    return vendor


@transaction.atomic
def vendor_reject(*, vendor_id: UUID, reason: Optional[str] = None) -> Vendor:
    """
    Reject a vendor account.

    Args:
        vendor_id: Vendor UUID
        reason: Rejection reason

    Returns:
        Updated Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    vendor.is_approved = False
    vendor.approved_at = None
    vendor.save()

    # TODO: Send rejection notification with reason

    return vendor


@transaction.atomic
def vendor_suspend(*, vendor_id: UUID, reason: Optional[str] = None) -> Vendor:
    """
    Suspend a vendor account.

    Args:
        vendor_id: Vendor UUID
        reason: Suspension reason

    Returns:
        Updated Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    vendor.is_active = False
    vendor.save()

    # TODO: Send suspension notification

    return vendor


@transaction.atomic
def vendor_activate(*, vendor_id: UUID) -> Vendor:
    """
    Activate a suspended vendor account.

    Args:
        vendor_id: Vendor UUID

    Returns:
        Updated Vendor instance

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    if not vendor.is_approved:
        raise VendorNotApprovedError("Cannot activate unapproved vendor")

    vendor.is_active = True
    vendor.save()

    return vendor


@transaction.atomic
def vendor_delete(*, vendor_id: UUID) -> None:
    """
    Soft delete a vendor account.

    Args:
        vendor_id: Vendor UUID

    Raises:
        Vendor.DoesNotExist: If vendor not found
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
    except Vendor.DoesNotExist:
        raise VendorNotApprovedError("Vendor not found")

    vendor.is_active = False
    vendor.save()


def create_platform_vendor(*, admin_user: User, business_name: str, **kwargs) -> Vendor:
    """
    Create Vendor account for platform owner.
    Auto-approved, Zero commission.

    Args:
        admin_user: Admin user instance
        business_name: Business name
        **kwargs: Additional vendor fields

    Returns:
        Created Vendor instance

    Raises:
        UnauthorizedAccessError: If user is not admin
    """
    if not admin_user.is_staff:
        raise UnauthorizedAccessError("Only admin user can create platform vendor account")

    return vendor_create(
        user=admin_user,
        business_name=business_name,
        commission_rate=Decimal("0.00"),
        is_platform_vendor=True,
        is_approved=True,
        **kwargs,
    )
