"""
Admin URLs for Orders app - endpoints for authenticated admins.
"""

from django.urls import path

from .. import views

app_name = "orders_admin"

urlpatterns = [
    # Admin order management
    path("orders/", views.AdminOrderListAPIView.as_view(), name="admin_orders"),
    path("orders/", views.AdminOrderCreateAPIView.as_view(), name="admin_order_create"),
    path(
        "orders/<uuid:order_id>/",
        views.AdminOrderDetailAPIView.as_view(),
        name="admin_order_detail",
    ),
    path(
        "orders/<uuid:order_id>/update/",
        views.AdminOrderUpdateAPIView.as_view(),
        name="admin_order_update",
    ),
    path(
        "orders/<uuid:order_id>/cancel/",
        views.AdminOrderCancelAPIView.as_view(),
        name="admin_order_cancel",
    ),
    path(
        "orders/<uuid:order_id>/generate-invoice/",
        views.AdminOrderGenerateInvoiceAPIView.as_view(),
        name="admin_order_generate_invoice",
    ),
]
