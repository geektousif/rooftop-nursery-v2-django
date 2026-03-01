from rest_framework.routers import DefaultRouter

from ..views.crud import ProductVariantViewSet, ProductViewSet

router = DefaultRouter()

router.register("variants", ProductVariantViewSet, basename="product-variants")
router.register("", ProductViewSet, basename="products")

# router.register("variants", ProductVariantViewSet)

# urlpatterns = [
#     path("", ProductListView.as_view({"get": "list"}), name="product-list"),
#     path("", ProductCreateView.as_view({"post": "create"}), name="product-create"),
# ]


urlpatterns = router.urls
