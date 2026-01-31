"""
Public URLs for Orders app - endpoints that don't require authentication.
"""
from django.urls import path

app_name = 'orders_public'

urlpatterns = [
    # Public order-related endpoints
    path('checkout/guest/', views.GuestCheckoutAPIView.as_view(), name='guest_checkout'),
    path('checkout/validate/', views.ValidateCheckoutAPIView.as_view(), name='validate_checkout'),
    path('checkout/calculate/', views.CalculateOrderAPIView.as_view(), name='calculate_order'),
    path('orders/', views.OrderCreateAPIView.as_view(), name='order_create'),
]