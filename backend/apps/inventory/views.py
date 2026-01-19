from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models

from apps.inventory.models import Stock, InventoryLog
from apps.inventory.serializers import StockSerializer, InventoryLogSerializer


class StockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock.
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['variant']
    search_fields = ['variant__sku', 'variant__product__name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('variant', 'variant__product')
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get all items with low stock."""
        queryset = self.get_queryset().filter(
            available_quantity__lte=models.F('low_stock_threshold')
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing inventory logs (read-only).
    """
    queryset = InventoryLog.objects.all()
    serializer_class = InventoryLogSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['variant', 'action_type', 'reference_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('variant', 'variant__product')
        return queryset