from django.urls import include, path

urlpatterns = [
    path("auth/", include("auth_kit.urls")),
    path("admin/", include("api.v1.admin.urls")),
    path("vendor/", include("api.v1.vendor.urls")),
    path("", include("api.v1.public.urls")),
]
