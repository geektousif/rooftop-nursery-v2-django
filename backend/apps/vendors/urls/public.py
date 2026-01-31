"""
Public URLs for Vendors app - endpoints that don't require authentication.
"""
from django.urls import path

app_name = 'vendors_public'

urlpatterns = [
    # Public vendor endpoints
    path('', views.VendorPublicListAPIView.as_view(), name='vendor_public_list'),
    path('<uuid:vendor_id>/', views.VendorPublicDetailAPIView.as_view(), name='vendor_public_detail'),
    path('<uuid:vendor_id>/products/', views.VendorPublicProductsAPIView.as_view(), name='vendor_public_products'),
]