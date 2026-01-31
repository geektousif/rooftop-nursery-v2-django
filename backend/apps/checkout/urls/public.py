"""
Public URLs for Checkout app - endpoints that don't require authentication.
"""
from django.urls import path

app_name = 'checkout_public'

urlpatterns = [
    # Public checkout endpoints
    path('guest/', views.GuestCheckoutAPIView.as_view(), name='guest_checkout'),
    path('validate/', views.ValidateCheckoutAPIView.as_view(), name='validate_checkout'),
    path('calculate/', views.CalculateCheckoutAPIView.as_view(), name='calculate_checkout'),
]
