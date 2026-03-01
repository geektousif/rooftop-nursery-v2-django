from django.urls import include, path

urlpatterns = [
    # public endpoints
    path("categories/", include("apps.domains.categories.urls.public")),
    # path("coupons/", include("apps.domains.coupons.urls.public")),
    path("products/", include("apps.domains.products.api.public.urls")),
    path("users/", include("apps.domains.users.urls")),
    # path("customers/", include("apps.domains.customers.urls")),
    path("orders/", include("apps.domains.orders.urls.public")),
    # path("inventory/", include("apps.domains.inventory.urls.public")),
    # path("payments/", include("apps.domains.payments.urls")),
    # path("vendors/", include("apps.domains.vendors.urls")),
    # path("images/", include("apps.integrations.images.urls")),
    # path("storefront/", include("apps.domains.storefront.urls")),
    # path("webhooks/", include("apps.delivery.webhooks.urls")),
]
