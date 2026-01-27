from django.urls import path

from apps.products.views import ProductSearchAPIView, VariantDetailAPIView, VariantListAPIView

# router = DefaultRouter()
# router.register(r"products", ProductViewSet, basename="product")
# router.register(r"products-variants", ProductVariantViewSet, basename="product-variant")
# router.register(r"products-reviews", ProductReviewViewSet, basename="product-review")

urlpatterns = [
    # path("", include(router.urls)),
    path("", VariantListAPIView.as_view(), name="variant-list"),
    path("<slug:slug>/", VariantDetailAPIView.as_view(), name="variant-detail"),
    path("search/", ProductSearchAPIView.as_view(), name="product-search"),
]
