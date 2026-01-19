from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.storefront.views import BannerViewSet, StorefrontSettingViewSet

router = DefaultRouter()
router.register(r'banners', BannerViewSet, basename='banner')
router.register(r'settings', StorefrontSettingViewSet, basename='storefront-setting')

urlpatterns = [
    path('', include(router.urls)),
]