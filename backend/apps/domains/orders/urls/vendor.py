"""
Vendor URLs for Orders app - endpoints for authenticated vendors.
"""
from django.urls import path

app_name = 'orders_vendor'

urlpatterns = [
    # Vendor order management (order items for their products)
    path('orders/', views.VendorOrderListAPIView.as_view(), name='vendor_orders'),
    path('orders/<uuid:order_item_id>/', views.VendorOrderItemDetailAPIView.as_view(), name='vendor_order_item_detail'),
    path('orders/<uuid:order_item_id>/ship/', views.VendorOrderItemShipAPIView.as_view(), name='vendor_order_item_ship'),
    path('orders/<uuid:order_item_id>/cancel/', views.VendorOrderItemCancelAPIView.as_view(), name='vendor_order_item_cancel'),
]