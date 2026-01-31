"""
Main URLs for Orders app - includes all role-based URL configurations.
"""
from django.urls import path, include

urlpatterns = [
    # Public endpoints (no authentication required)
    path('public/', include('apps.orders.urls.public')),
    
    # Customer endpoints (authentication + customer role required)
    path('customer/', include('apps.orders.urls.customer')),
    
    # Vendor endpoints (authentication + vendor role required)
    path('vendor/', include('apps.orders.urls.vendor')),
    
    # Admin endpoints (authentication + admin role required)
    path('admin/', include('apps.orders.urls.admin')),
]