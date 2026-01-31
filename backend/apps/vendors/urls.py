"""
Main URLs for Vendors app - includes all role-based URL configurations.
"""

from django.urls import include, path

urlpatterns = [
    # Public endpoints (no authentication required)
    path("public/", include("apps.vendors.urls.public")),
    # Vendor endpoints (authentication + vendor role required)
    path("vendor/", include("apps.vendors.urls.vendor")),
    # Admin endpoints (authentication + admin role required)
    path("admin/", include("apps.vendors.urls.admin")),
]
