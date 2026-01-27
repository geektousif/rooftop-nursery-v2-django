from rest_framework import serializers

from apps.customers.serializers import CustomerListSerializer
from apps.orders.models import Order, OrderItem
from apps.products.serializers import VariantListSerializer as ProductVariantListSerializer
from apps.vendors.serializers import VendorListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem."""

    variant = ProductVariantListSerializer(read_only=True)
    variant_id = serializers.UUIDField(write_only=True, required=False)
    vendor = VendorListSerializer(read_only=True)
    vendor_id = serializers.UUIDField(write_only=True, required=False)
    product_name = serializers.CharField(source="variant.product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order",
            "variant",
            "variant_id",
            "product_name",
            "quantity",
            "unit_price",
            "product_snapshot",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "vendor",
            "vendor_id",
            "is_refunded",
            "fulfillment_status",
            "shipped_at",
            "cancelled_at",
            "delivered_at",
            "cancellation_reason",
            "vendor_payout_amount",
            "vendor_payout_status",
            "tracking_number",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    """Full serializer for Order."""

    customer = CustomerListSerializer(read_only=True)
    customer_id = serializers.UUIDField(write_only=True, required=False)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "customer_id",
            "order_number",
            "total_quantity",
            "subtotal_amount",
            "tax_amount",
            "shipping_amount",
            "discount_amount",
            "grand_total",
            "shipping_address",
            "billing_address",
            "status",
            "payment_status",
            "coupon_code_applied",
            "notes",
            "confirmed_at",
            "shipped_at",
            "delivered_at",
            "cancelled_at",
            "cancellation_reason",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "confirmed_at",
            "shipped_at",
            "delivered_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists."""

    customer_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "grand_total",
            "status",
            "payment_status",
            "item_count",
            "created_at",
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return obj.customer.user.full_name
        return obj.shipping_address.get("full_name", "N/A")

    def get_item_count(self, obj):
        return obj.orderitem_set.count()
