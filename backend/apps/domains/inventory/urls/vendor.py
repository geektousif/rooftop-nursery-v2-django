"""
Vendor URLs for Inventory app - endpoints for authenticated vendors.
"""
from django.urls import path

app_name = 'inventory_vendor'

urlpatterns = [
    # Vendor inventory management
    path('', views.VendorInventoryListAPIView.as_view(), name='vendor_inventory'),
    path('<uuid:variant_id>/restock/', views.VendorInventoryRestockAPIView.as_view(), name='vendor_inventory_restock'),
    path('<uuid:variant_id>/adjust/', views.VendorInventoryAdjustAPIView.as_view(), name='vendor_inventory_adjust'),
    path('logs/', views.VendorInventoryLogsAPIView.as_view(), name='vendor_inventory_logs'),
    path('low-stock/', views.VendorInventoryLowStockAPIView.as_view(), name='vendor_inventory_low_stock'),
    path('out-of-stock/', views.VendorInventoryOutOfStockAPIView.as_view(), name='vendor_inventory_out_of_stock'),
]