from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..common.views import ProductViewSet, VariantViewSet

router = DefaultRouter()
router.register(r"", ProductViewSet, basename="product_admin")
router.register(r"variants", VariantViewSet, basename="product_variant_admin")

urlpatterns = [
    path("", include(router.urls)),
]
