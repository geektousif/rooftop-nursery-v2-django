from django.urls import include, path

urlpatterns = [
    # public endpoints
    path("categories/", include("apps.categories.urls.public")),
    path("products/", include("apps.products.urls.public")),
    path("vendors/", include("apps.vendors.urls")),
]
