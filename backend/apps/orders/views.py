from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from apps.orders.serializers import OrderSerializer, OrderListSerializer, OrderItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'customer']
    search_fields = ['order_number', 'customer__user__email', 'customer__user__phone']
    ordering_fields = ['created_at', 'grand_total']
    ordering = ['-created_at']
    lookup_field = 'order_number'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('customer', 'customer__user').prefetch_related(
            'orderitem_set',
            'orderitem_set__variant',
            'orderitem_set__vendor'
        )
        return queryset
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, order_number=None):
        """Confirm an order."""
        order = self.get_object()
        if order.status != OrderStatus.PENDING:
            return Response(
                {'error': 'Only pending orders can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = OrderStatus.PLACED
        order.confirmed_at = timezone.now()
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ship(self, request, order_number=None):
        """Mark an order as shipped."""
        order = self.get_object()
        if order.status not in [OrderStatus.PLACED, OrderStatus.SHIPPED]:
            return Response(
                {'error': 'Only placed orders can be shipped'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = OrderStatus.SHIPPED
        order.shipped_at = timezone.now()
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, order_number=None):
        """Mark an order as delivered."""
        order = self.get_object()
        if order.status != OrderStatus.SHIPPED:
            return Response(
                {'error': 'Only shipped orders can be delivered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = OrderStatus.DELIVERED
        order.delivered_at = timezone.now()
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, order_number=None):
        """Cancel an order."""
        order = self.get_object()
        if order.status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
            return Response(
                {'error': 'Cannot cancel delivered or already cancelled orders'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cancellation_reason = request.data.get('cancellation_reason', '')
        order.status = OrderStatus.CANCELLED
        order.cancelled_at = timezone.now()
        order.cancellation_reason = cancellation_reason
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def items(self, request, order_number=None):
        """Get all items for an order."""
        order = self.get_object()
        items = order.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing order items.
    """
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order', 'variant', 'vendor', 'fulfillment_status', 'is_refunded']
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related(
            'order',
            'variant',
            'variant__product',
            'vendor'
        )
        return queryset