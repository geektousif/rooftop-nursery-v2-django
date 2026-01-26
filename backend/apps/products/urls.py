from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.products.views import (
    ProductListAPIView,
    ProductVariantViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"products-variants", ProductVariantViewSet, basename="product-variant")
# router.register(r"products-reviews", ProductReviewViewSet, basename="product-review")

urlpatterns = [
    # path("", include(router.urls)),
    path("list/", ProductListAPIView.as_view(), name="product-list"),
]
