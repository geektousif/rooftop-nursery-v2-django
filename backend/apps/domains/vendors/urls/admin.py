"""
Admin URLs for Vendors app - endpoints for authenticated admins.
"""

from django.urls import path

from .. import views

app_name = "vendors_admin"

urlpatterns = [
    # Admin vendor management
    path("", views.VendorAdminListAPIView.as_view(), name="admin_vendors"),
    path("<uuid:vendor_id>/", views.VendorAdminDetailAPIView.as_view(), name="admin_vendor_detail"),
    path("", views.VendorAdminCreateAPIView.as_view(), name="admin_vendor_create"),
    path(
        "<uuid:vendor_id>/update/",
        views.VendorAdminUpdateAPIView.as_view(),
        name="admin_vendor_update",
    ),
    path(
        "<uuid:vendor_id>/approve/",
        views.VendorAdminApproveAPIView.as_view(),
        name="admin_vendor_approve",
    ),
    path(
        "<uuid:vendor_id>/reject/",
        views.VendorAdminRejectAPIView.as_view(),
        name="admin_vendor_reject",
    ),
    path(
        "<uuid:vendor_id>/suspend/",
        views.VendorAdminSuspendAPIView.as_view(),
        name="admin_vendor_suspend",
    ),
    path(
        "<uuid:vendor_id>/activate/",
        views.VendorAdminActivateAPIView.as_view(),
        name="admin_vendor_activate",
    ),
    path(
        "<uuid:vendor_id>/commission/",
        views.VendorAdminCommissionAPIView.as_view(),
        name="admin_vendor_commission",
    ),
    path(
        "pending-approval/",
        views.VendorAdminPendingListAPIView.as_view(),
        name="admin_vendors_pending",
    ),
    path(
        "platform/", views.VendorAdminPlatformListAPIView.as_view(), name="admin_vendors_platform"
    ),
]
