"""
Admin URLs for Inventory app - endpoints for authenticated admins.
"""
from django.urls import path

app_name = 'inventory_admin'

urlpatterns = [
    # Admin inventory management
    path('', views.AdminInventoryListAPIView.as_view(), name='admin_inventory'),
    path('logs/', views.AdminInventoryLogsAPIView.as_view(), name='admin_inventory_logs'),
    path('<uuid:variant_id>/adjust/', views.AdminInventoryAdjustAPIView.as_view(), name='admin_inventory_adjust'),
    path('low-stock/', views.AdminInventoryLowStockAPIView.as_view(), name='admin_inventory_low_stock'),
    path('out-of-stock/', views.AdminInventoryOutOfStockAPIView.as_view(), name='admin_inventory_out_of_stock'),
]