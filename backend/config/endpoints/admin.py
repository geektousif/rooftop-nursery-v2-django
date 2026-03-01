from django.urls import include, path

urlpatterns = [
    path("categories/", include("apps.domains.categories.urls.admin")),
    path("products/", include("apps.domains.products.api.admin.urls")),
]
