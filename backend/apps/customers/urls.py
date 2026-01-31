"""
Main URLs for Customers app - includes all role-based URL configurations.
"""
from django.urls import path, include

urlpatterns = [
    # Customer endpoints (authentication + customer role required)
    path('customer/', include('apps.customers.urls.customer')),
    
    # Admin endpoints (authentication + admin role required)
    path('admin/', include('apps.customers.urls.admin')),
]