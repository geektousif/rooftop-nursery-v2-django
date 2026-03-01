from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.ProductImageViewset, basename="images")

app_name = "images"
urlpatterns = [
    path("authenticate/", views.AuthenticateImageUploadView.as_view(), name="authenticate"),
]

urlpatterns += router.urls
