from rest_framework import serializers

from apps.domains.orders.serializers import OrderListSerializer

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment."""

    order = OrderListSerializer(read_only=True)
    order_id = serializers.UUIDField(write_only=True, required=False)
    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "order_id",
            "order_number",
            "gateway_order_id",
            "gateway_transaction_id",
            "payment_method",
            "amount",
            "status",
            "gateway_response",
            "failure_reason",
            "paid_at",
            "refunded_at",
            "refund_amount",
            "idempotency_key",
            "attempt_count",
            "last_attempted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "idempotency_key",
            "paid_at",
            "refunded_at",
            "created_at",
            "updated_at",
        ]


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for payment lists."""

    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order_number",
            "payment_method",
            "amount",
            "status",
            "created_at",
        ]
