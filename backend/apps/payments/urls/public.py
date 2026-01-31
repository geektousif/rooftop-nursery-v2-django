"""
Public URLs for Payments app - endpoints that don't require authentication.
"""
from django.urls import path

app_name = 'payments_public'

urlpatterns = [
    # Public payment endpoints
    path('initiate/', views.PaymentInitiateAPIView.as_view(), name='payment_initiate'),
    path('<uuid:payment_id>/status/', views.PaymentStatusAPIView.as_view(), name='payment_status'),
    path('webhooks/phonepe/', views.PhonePeWebhookAPIView.as_view(), name='phonepe_webhook'),
]