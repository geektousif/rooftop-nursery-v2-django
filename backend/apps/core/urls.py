from django.urls import include, path

urlpatterns = [
    path("auth/", include("auth_kit.urls")),
    path("coupons/", include("apps.coupons.urls")),
    path("products/", include("apps.products.urls")),
    path("users/", include("apps.users.urls")),
    path("customers/", include("apps.customers.urls")),
    path("orders/", include("apps.orders.urls")),
    path("inventory/", include("apps.inventory.urls")),
    path("payments/", include("apps.payments.urls")),
    path("vendors/", include("apps.vendors.urls")),
    path("images/", include("apps.images.urls")),
    path("storefront/", include("apps.storefront.urls")),
    path("webhooks/", include("apps.webhooks.urls")),
]
