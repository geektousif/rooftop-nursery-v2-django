"""
Customer URLs for Customers app - endpoints for authenticated customers.
"""
from django.urls import path

app_name = 'customers_customer'

urlpatterns = [
    # Customer profile management
    path('profile/', views.CustomerProfileAPIView.as_view(), name='customer_profile'),
    path('profile/update/', views.CustomerProfileUpdateAPIView.as_view(), name='customer_profile_update'),
    
    # Address management
    path('addresses/', views.CustomerAddressListAPIView.as_view(), name='customer_addresses'),
    path('addresses/', views.CustomerAddressCreateAPIView.as_view(), name='customer_address_create'),
    path('addresses/<uuid:address_id>/', views.CustomerAddressDetailAPIView.as_view(), name='customer_address_detail'),
    path('addresses/<uuid:address_id>/update/', views.CustomerAddressUpdateAPIView.as_view(), name='customer_address_update'),
    path('addresses/<uuid:address_id>/delete/', views.CustomerAddressDeleteAPIView.as_view(), name='customer_address_delete'),
    path('addresses/<uuid:address_id>/set-default/', views.CustomerAddressSetDefaultAPIView.as_view(), name='customer_address_set_default'),
]
