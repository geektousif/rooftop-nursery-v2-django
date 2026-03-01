from rest_framework.routers import DefaultRouter

# from ..views.crud import ProductVariantViewSet, ProductViewSet

router = DefaultRouter()
from ..views.crud import ProductViewSet

router.register("", ProductViewSet, basename="products")
# router.register("variants", ProductVariantViewSet)

# urlpatterns = [
#     path("", ProductListView.as_view({"get": "list"}), name="product-list"),
# ]


urlpatterns = router.urls
