from django.urls import path

from ..views.public import PublicProductViewSet

urlpatterns = [
    path("search/", PublicProductViewSet.as_view({"get": "search"}), name="product-search"),
    path("<slug:slug>/", PublicProductViewSet.as_view({"get": "retrieve"}), name="product-detail"),
    path("", PublicProductViewSet.as_view({"get": "list"}), name="product-list"),
]
