from django.urls import include, path

urlpatterns = [
    path("categories/", include("apps.domains.categories.urls.vendor")),
]
