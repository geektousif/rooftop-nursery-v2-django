from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from apps.vendors.models import Vendor
from apps.vendors.serializers import VendorSerializer, VendorListSerializer


class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendors.
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_approved']
    search_fields = ['business_name', 'user__email', 'user__full_name']
    ordering_fields = ['business_name', 'created_at']
    ordering = ['business_name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VendorListSerializer
        return VendorSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('user').prefetch_related('product_set')
        return queryset