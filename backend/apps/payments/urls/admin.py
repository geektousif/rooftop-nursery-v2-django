"""
Admin URLs for Payments app - endpoints for authenticated admins.
"""
from django.urls import path

app_name = 'payments_admin'

urlpatterns = [
    # Admin payment management
    path('', views.PaymentAdminListAPIView.as_view(), name='admin_payments'),
    path('<uuid:payment_id>/', views.PaymentAdminDetailAPIView.as_view(), name='admin_payment_detail'),
    path('<uuid:payment_id>/refund/', views.PaymentAdminRefundAPIView.as_view(), name='admin_payment_refund'),
]