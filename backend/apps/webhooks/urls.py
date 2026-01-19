from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.webhooks.views import WebhookEventViewSet

router = DefaultRouter()
router.register(r'webhook-events', WebhookEventViewSet, basename='webhook-event')

urlpatterns = [
    path('', include(router.urls)),
]