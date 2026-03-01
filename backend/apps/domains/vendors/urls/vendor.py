"""
Vendor URLs for Vendors app - endpoints for authenticated vendors.
"""

from django.urls import path

from .. import views

app_name = "vendors_vendor"

urlpatterns = [
    # Vendor authentication
    path("auth/register/", views.VendorRegisterAPIView.as_view(), name="vendor_register"),
    path("auth/login/", views.VendorLoginAPIView.as_view(), name="vendor_login"),
    path("auth/status/", views.VendorAuthStatusAPIView.as_view(), name="vendor_auth_status"),
    # Vendor profile management
    path("profile/", views.VendorProfileAPIView.as_view(), name="vendor_profile"),
    path("profile/update/", views.VendorUpdateAPIView.as_view(), name="vendor_profile_update"),
]
