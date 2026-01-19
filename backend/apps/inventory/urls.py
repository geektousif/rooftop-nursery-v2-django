from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.inventory.views import StockViewSet, InventoryLogViewSet

router = DefaultRouter()
router.register(r'stock', StockViewSet, basename='stock')
router.register(r'inventory-logs', InventoryLogViewSet, basename='inventory-log')

urlpatterns = [
    path('', include(router.urls)),
]