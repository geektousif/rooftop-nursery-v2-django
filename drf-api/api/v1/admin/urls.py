from django.urls import include, path

urlpatterns = [
    path("categories/", include("apps.categories.urls.admin")),
    path("products/", include("apps.products.urls.admin")),
    path("vendors/", include("apps.vendors.urls")),
    path("images/", include("apps.images.urls")),
]
