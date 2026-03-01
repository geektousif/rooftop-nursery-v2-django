from django.urls import include, path

urlpatterns = [
    path("categories/", include("apps.categories.urls.vendor")),
    path("products/", include("apps.products.urls.vendor")),
]
