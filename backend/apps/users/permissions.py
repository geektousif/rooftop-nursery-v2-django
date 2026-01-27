import operator

from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access to admin users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated and request.user.can_access_admin_panel()
        )


class IsVendor(BasePermission):
    """User has vendor privileges."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_access_vendor_panel()


class IsAdminOrReadOnly(IsAdminUser):
    """
    Allows access to admin users or read-only access.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in ["GET", "HEAD", "OPTIONS"]
            or super().has_permission(request, view)
        )


# class IsCustomerOwner(BasePermission):
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.role == UserRoles.CUSTOMER)

#     def has_object_permission(self, request, view, obj):
#         if hasattr(obj, "customer") and hasattr(obj.customer, "user"):
#             return obj.customer.user == request.user

#         # Direct user relationship (e.g., Order.customer)
#         if hasattr(obj, "user"):
#             return obj.user == request.user

#         return False


# class IsVendorOwner(BasePermission):
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.role == UserRoles.VENDOR)

#     def has_object_permission(self, request, view, obj):
#         if hasattr(obj, "vendor") and hasattr(obj.vendor, "user"):
#             return obj.vendor.user == request.user

#         # Product -> Vendor
#         if hasattr(obj, "product") and hasattr(obj.product, "vendor"):
#             return obj.product.vendor.user == request.user

#         # Variant -> Product -> Vendor
#         if hasattr(obj, "variant") and hasattr(obj.variant, "product"):
#             return obj.variant.product.vendor.user == request.user

#         # OrderItem -> Vendor
#         if hasattr(obj, "vendor"):
#             return bool(request.user == obj.vendor.user)

#         return False


class OwnerOnly(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.can_access_admin_panel():
            return True

    def has_object_permission(self, request, view, obj):
        # if request.method in permissions.SAFE_METHODS:
        #     return True

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
                continue

        return False


class IsOwnerOrReadOnly(OwnerOnly):
    def has_object_permission(self, request, view, obj):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return super().has_object_permission(request, view, obj)


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
