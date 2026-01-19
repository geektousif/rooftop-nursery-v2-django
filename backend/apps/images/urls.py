from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.images.views import ProductImageViewSet

router = DefaultRouter()
router.register(r'product-images', ProductImageViewSet, basename='product-image')

urlpatterns = [
    path('', include(router.urls)),
]