from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.customers.models import Customer, Address
from apps.customers.serializers import (
    CustomerSerializer,
    CustomerListSerializer,
    AddressSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing customers.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_guest', 'user']
    search_fields = ['user__email', 'user__phone', 'user__full_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        return CustomerSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('user').prefetch_related(
            'address_set',
            'order_set'
        )
        return queryset
    
    @action(detail=True, methods=['get', 'post'])
    def addresses(self, request, pk=None):
        """Get or create addresses for a customer."""
        customer = self.get_object()
        if request.method == 'GET':
            addresses = customer.address_set.all()
            serializer = AddressSerializer(addresses, many=True)
            return Response(serializer.data)
        else:
            serializer = AddressSerializer(data={**request.data, 'customer': customer.id})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=201)


class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing addresses.
    """
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['customer', 'type', 'is_default']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('customer', 'customer__user')
        return queryset