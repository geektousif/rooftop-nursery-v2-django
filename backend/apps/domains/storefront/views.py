from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Banner, StorefrontSetting
from .serializers import BannerSerializer, StorefrontSettingSerializer


class BannerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing banners.
    """

    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["position_type", "is_active"]
    ordering_fields = ["sort_order", "created_at"]
    ordering = ["sort_order"]

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get all active banners that are currently valid."""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            is_active=True, start_date__lte=now, end_date__gte=now
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-position/(?P<position>[^/.]+)")
    def by_position(self, request, position=None):
        """Get banners by position type."""
        now = timezone.now()
        queryset = self.get_queryset().filter(
            position_type=position, is_active=True, start_date__lte=now, end_date__gte=now
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StorefrontSettingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing storefront settings.
    """

    queryset = StorefrontSetting.objects.all()
    serializer_class = StorefrontSettingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "type"]
    search_fields = ["key", "description"]
    ordering_fields = ["key", "created_at"]
    ordering = ["key"]
    lookup_field = "key"

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get all active settings."""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
