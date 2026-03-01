from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WebhookEventViewSet

router = DefaultRouter()
router.register(r"webhook-events", WebhookEventViewSet, basename="webhook-event")

urlpatterns = [
    path("", include(router.urls)),
]
