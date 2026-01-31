from django.urls import path

# from rest_framework.routers import DefaultRouter
from apps.images.views import imagekit_auth_view

# router = DefaultRouter()
# router.register(r"product-images", ProductImageViewSet, basename="product-image")

urlpatterns = [
    path("sign/", imagekit_auth_view, name="imagekit-auth"),
]
