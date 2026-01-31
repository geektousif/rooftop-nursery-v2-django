"""
Main URLs for Inventory app - includes all role-based URL configurations.
"""
from django.urls import path, include

urlpatterns = [
    # Vendor endpoints (authentication + vendor role required)
    path('vendor/', include('apps.inventory.urls.vendor')),
    
    # Admin endpoints (authentication + admin role required)
    path('admin/', include('apps.inventory.urls.admin')),
]