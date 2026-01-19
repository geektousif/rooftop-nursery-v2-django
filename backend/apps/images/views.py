from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from apps.images.models import ProductImage
from apps.images.serializers import ProductImageSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product images.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['variant', 'is_display_image']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('variant', 'variant__product')
        return queryset