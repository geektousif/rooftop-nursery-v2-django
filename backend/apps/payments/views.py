from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from apps.payments.models import Payment, PaymentStatus
from apps.payments.serializers import PaymentSerializer, PaymentListSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payments.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'order']
    search_fields = ['gateway_order_id', 'gateway_transaction_id', 'order__order_number']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('order', 'order__customer')
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a payment as paid."""
        payment = self.get_object()
        if payment.status == PaymentStatus.PAID:
            return Response(
                {'error': 'Payment is already marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = PaymentStatus.PAID
        payment.paid_at = timezone.now()
        payment.save()
        
        # Update order payment status
        payment.order.payment_status = PaymentStatus.PAID
        payment.order.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Process a refund for a payment."""
        payment = self.get_object()
        if payment.status != PaymentStatus.PAID:
            return Response(
                {'error': 'Only paid payments can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        refund_amount = float(request.data.get('refund_amount', payment.amount))
        if refund_amount > payment.amount:
            return Response(
                {'error': 'Refund amount cannot exceed payment amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = PaymentStatus.REFUNDED
        payment.refunded_at = timezone.now()
        payment.refund_amount = refund_amount
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)