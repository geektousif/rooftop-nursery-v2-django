from django.core.exceptions import PermissionDenied
from django.utils import timezone

from apps.vendors.models import Vendor


def create_platform_vendor(*, admin_user, business_name, **kwargs):
    """
    Create Vendor account for platform owner
    Auto-approved, Zero commission
    """

    if not admin_user.is_admin():
        raise PermissionDenied("Only admin user can create owner vendor account")

    # with transaction.atomic():
    #     admin_user.role = User.UserRoles.ADMIN
    #     admin_user.save()

    vendor = Vendor.objects.create(
        user=admin_user,
        business_name=business_name,
        commission_rate=0,
        is_platform_vendor=True,
        is_approved=True,
        approved_at=timezone.now(),
        **kwargs,
    )

    return vendor
