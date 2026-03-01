from django.urls import include, path

urlpatterns = [
    path("auth/", include("auth_kit.urls")),
    path("admin/", include("api.endpoints.admin")),
    path("vendor/", include("api.endpoints.vendor")),
    path("", include("api.endpoints.public")),
]
