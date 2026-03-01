from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WebhookEvents
from .serializers import WebhookEventListSerializer, WebhookEventSerializer


class WebhookEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing webhook events.
    """

    queryset = WebhookEvents.objects.all()
    serializer_class = WebhookEventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["processed", "event_type"]
    search_fields = ["event_type"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return WebhookEventListSerializer
        return WebhookEventSerializer

    @action(detail=False, methods=["get"])
    def unprocessed(self, request):
        """Get all unprocessed webhook events."""
        queryset = self.get_queryset().filter(processed=False)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def mark_processed(self, request, pk=None):
        """Mark a webhook event as processed."""
        event = self.get_object()
        event.processed = True
        if "processing_error" in request.data:
            event.processing_error = request.data["processing_error"]
        event.save()
        serializer = self.get_serializer(event)
        return Response(serializer.data)
