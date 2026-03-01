"""
Admin URLs for Customers app - endpoints for authenticated admins.
"""

from django.urls import path

from .. import views

app_name = "customers_admin"

urlpatterns = [
    # Admin customer management
    path("", views.CustomerAdminListAPIView.as_view(), name="admin_customers"),
    path(
        "<uuid:customer_id>/",
        views.CustomerAdminDetailAPIView.as_view(),
        name="admin_customer_detail",
    ),
    path("", views.CustomerAdminCreateAPIView.as_view(), name="admin_customer_create"),
    path(
        "<uuid:customer_id>/update/",
        views.CustomerAdminUpdateAPIView.as_view(),
        name="admin_customer_update",
    ),
    path(
        "<uuid:customer_id>/activate/",
        views.CustomerAdminActivateAPIView.as_view(),
        name="admin_customer_activate",
    ),
    path(
        "<uuid:customer_id>/deactivate/",
        views.CustomerAdminDeactivateAPIView.as_view(),
        name="admin_customer_deactivate",
    ),
    path(
        "<uuid:customer_id>/delete/",
        views.CustomerAdminDeleteAPIView.as_view(),
        name="admin_customer_delete",
    ),
    path(
        "registered/",
        views.CustomerAdminRegisteredListAPIView.as_view(),
        name="admin_customers_registered",
    ),
    path("guests/", views.CustomerAdminGuestsListAPIView.as_view(), name="admin_customers_guests"),
]
