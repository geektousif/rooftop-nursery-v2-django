from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.reviews.views import ProductReviewViewSet

router = DefaultRouter()
router.register(r'reviews', ProductReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]