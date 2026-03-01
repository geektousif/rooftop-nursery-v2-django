"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static as static_urls
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("treenode/", include("treenode.urls", namespace="treenode")),
    # API endpoints
    path(
        "api/v1/",
        include(
            [
                path("auth/", include("auth_kit.urls"), name="auth_kit"),
                path("admin/", include("config.endpoints.admin"), name="admin_endpoints"),
                path("vendor/", include("config.endpoints.vendor"), name="vendor_endpoints"),
                path("", include("config.endpoints.public"), name="public_endpoints"),
            ],
        ),
    ),
    # Docs
    path("api/docs/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/docs/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += [
        # path("api/auth/ui/", AuthKitUIView.as_view(), name="auth_kit_ui"),
        path("silk/", include("silk.urls", namespace="silk")),
    ]
    urlpatterns += static_urls(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
