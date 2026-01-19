"""
URL configuration for core project.

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
from treenode.views import AutoTreeAPI

api_patterns = AutoTreeAPI(base_url="api/v1").discover()

urlpatterns = [
    path("", include((api_patterns, "treenode"), namespace="treenode")),
    path("admin/", admin.site.urls),
    # API endpoints
    # path('api/v1/', include('apps.categories.urls')),
    path("api/v1/", include("apps.products.urls")),
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.customers.urls")),
    path("api/v1/", include("apps.orders.urls")),
    path("api/v1/", include("apps.inventory.urls")),
    path("api/v1/", include("apps.coupons.urls")),
    path("api/v1/", include("apps.payments.urls")),
    path("api/v1/", include("apps.reviews.urls")),
    path("api/v1/", include("apps.vendors.urls")),
    path("api/v1/", include("apps.images.urls")),
    path("api/v1/", include("apps.storefront.urls")),
    path("api/v1/", include("apps.webhooks.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"
    ),
]


if settings.DEBUG:
    urlpatterns += [path("silk/", include("silk.urls", namespace="silk"))]
    urlpatterns += static_urls(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
