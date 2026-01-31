import logging
import operator

from django.core.cache import cache
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)

# ============================================================================
# ROLE DEFINITIONS - Single Source of Truth
# ============================================================================

ROLE_PERMISSIONS = {
    "super_admin": "*",  # Has all permissions
    "store_admin": "*",  # Has all permissions
    "vendor": [
        "category.view",
        "product.view_own",
        "product.create",
        "product.edit_own",
        "product.delete_own",
        "order.view_own",
        "order.manage_own",
        "inventory.manage_own",
        "analytics.view_own",
        "customer.view_own",
    ],
    "customer": [
        "order.view_own",
        "order.create",
        "order.cancel_own",
    ],
}

# def get_user_permissions(user) -> set:

#     role = user.role
#     return set(ROLE_PERMISSIONS.get(role, []))


def get_user_permissions(user) -> list:
    """
    Get permissions for a user with caching.
    Cache invalidated on user role change.
    """
    if not user or not user.is_authenticated:
        return []

    # cache_key = f"user_permissions:{user.id}"
    # permissions = cache.get(cache_key)

    # if permissions is None:
    #     role_perms = ROLE_PERMISSIONS.get(user.role, [])
    #     permissions = ["*"] if role_perms == "*" else role_perms
    #     # Cache for 5 minutes
    #     cache.set(cache_key, permissions, 300)

    # return permissions

    role_perms = ROLE_PERMISSIONS.get(user.role, [])
    return ["*"] if role_perms == "*" else role_perms


def has_permission(user, permission: str) -> bool:
    """Check if user has a specific permission."""
    if not user or not user.is_authenticated:
        return False

    perms = get_user_permissions(user)
    return "*" in perms or permission in perms


def invalidate_user_permissions_cache(user):
    """Call this when user role changes."""
    cache_key = f"user_permissions:{user.id}"
    cache.delete(cache_key)


class ReadOnly(BasePermission):
    """Allow read-only access (GET, HEAD, OPTIONS)."""

    def has_permission(self, request, view):
        return request.method in ["GET", "HEAD", "OPTIONS"]


class IsAdminOrReadOnly(BasePermission):
    """
    Allows access to admin users or read-only access.
    """

    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True
        return bool(
            request.user and request.user.is_authenticated and request.user.can_access_admin_panel()
        )


class IsOwnerOrAdmin(BasePermission):
    """
    User must own the object OR be an admin.

    Usage:
        permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        owner_field = "user"  # Default
        # OR
        owner_field = ["user", "vendor.user"]  # Multiple ownership paths
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # if request.method in permissions.SAFE_METHODS:
        #     return True

        if request.user.can_access_admin_panel():
            return True

        owner_fields = getattr(view, "owner_field", ["user"])

        if isinstance(owner_fields, str):
            owner_fields = [owner_fields]

        for field_path in owner_fields:
            try:
                # Resolve the user object for this specific path
                # e.g., resolves "vendor.user" -> obj.vendor.user
                obj_owner = operator.attrgetter(field_path)(obj)

                # 4. If ANY match is found, grant permission immediately
                if obj_owner == request.user:
                    return True
            except AttributeError:
                logger.error(f"Invalid owner_field '{field_path}' on {view.__class__.__name__}")
                continue

        logger.warning(
            f"Unauthorized access attempt by user {request.user.id} ({request.user.role}) "  # type: ignore
            f"to {obj.__class__.__name__} {obj.id}"
        )
        return False


class AnyoneCanCreateOnly(BasePermission):
    """
    Allow anyone to create an object only. Not Update or Delete.
    Example: a new user registration, a new order, etc.
    """

    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS", "POST"] or (
            hasattr(view, "action") and getattr(view, "action") == "create"
        ):
            return True

        return False


class IsVendor(BasePermission):
    """
    Check if user is a vendor with approved account.
    
    Usage:
        permission_classes = [IsAuthenticated, IsVendor]
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'vendor'):
            return False
        
        # Vendor must be approved
        return request.user.vendor.is_approved


class IsVendorOwner(BasePermission):
    """
    Check if vendor owns the resource.
    
    Assumes obj has a 'vendor' attribute or 'product.vendor' path.
    
    Usage:
        permission_classes = [IsAuthenticated, IsVendor, IsVendorOwner]
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'vendor'):
            return False
        
        return request.user.vendor.is_approved
    
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if request.user.can_access_admin_panel():
            return True
        
        # Check vendor ownership
        vendor_field = getattr(view, 'vendor_field', 'vendor')
        
        try:
            if isinstance(vendor_field, str):
                obj_vendor = operator.attrgetter(vendor_field)(obj)
            else:
                # Handle nested paths like 'product.vendor'
                obj_vendor = operator.attrgetter('.'.join(vendor_field))(obj)
            
            return obj_vendor.id == request.user.vendor.id
        except AttributeError:
            logger.error(
                f"Invalid vendor_field '{vendor_field}' on {view.__class__.__name__}"
            )
            return False


class IsCustomer(BasePermission):
    """
    Check if user is a customer.
    
    Usage:
        permission_classes = [IsAuthenticated, IsCustomer]
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_customer


class IsCustomerOwner(BasePermission):
    """
    Check if customer owns the resource.
    
    Usage:
        permission_classes = [IsAuthenticated, IsCustomer, IsCustomerOwner]
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_customer
    
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if request.user.can_access_admin_panel():
            return True
        
        # Check customer ownership
        customer_field = getattr(view, 'customer_field', 'customer')
        
        try:
            if isinstance(customer_field, str):
                obj_customer = operator.attrgetter(customer_field)(obj)
            else:
                obj_customer = operator.attrgetter('.'.join(customer_field))(obj)
            
            # Handle both Customer model and user reference
            if hasattr(obj_customer, 'user'):
                return obj_customer.user.id == request.user.id
            return obj_customer.id == request.user.id
        except AttributeError:
            logger.error(
                f"Invalid customer_field '{customer_field}' on {view.__class__.__name__}"
            )
            return False