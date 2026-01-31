"""
Main URLs for Checkout app - includes all role-based URL configurations.
"""
from django.urls import path, include

urlpatterns = [
    # Public endpoints (no authentication required)
    path('public/', include('apps.checkout.urls.public')),
]
