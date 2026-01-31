"""
Customer URLs for Orders app - endpoints for authenticated customers.
"""
from django.urls import path

app_name = 'orders_customer'

urlpatterns = [
    # Customer order management
    path('orders/', views.CustomerOrderListAPIView.as_view(), name='customer_orders'),
    path('orders/<uuid:order_id>/', views.CustomerOrderDetailAPIView.as_view(), name='customer_order_detail'),
    path('orders/<uuid:order_id>/invoice/', views.OrderInvoiceAPIView.as_view(), name='order_invoice'),
    path('orders/<uuid:order_id>/track/', views.OrderTrackingAPIView.as_view(), name='order_tracking'),
    path('orders/<uuid:order_id>/cancel/', views.CustomerOrderCancelAPIView.as_view(), name='customer_order_cancel'),
    path('orders/<uuid:order_id>/return/', views.CustomerOrderReturnAPIView.as_view(), name='customer_order_return'),
]
