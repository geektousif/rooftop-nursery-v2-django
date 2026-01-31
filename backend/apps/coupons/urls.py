"""
Main URLs for Coupons app - includes all role-based URL configurations.
"""
from django.urls import path, include

urlpatterns = [
    # Public endpoints (no authentication required)
    path('public/', include('apps.coupons.urls.public')),
    
    # Admin endpoints (authentication + admin role required)
    path('admin/', include('apps.coupons.urls.admin')),
]