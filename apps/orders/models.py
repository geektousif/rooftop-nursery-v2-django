from django.db import models

from apps.core.models import BaseModel


# Create your models here.
class OrderStatus(models.TextChoices):
    PENDING = "PENDING"
    PLACED = "PLACED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Order(BaseModel):
    customer = models.ForeignKey("Customer", on_delete=models.SET_NULL, null=True)
    order_number = models.CharField(max_length=255, unique=True)
    total_quantity = models.PositiveIntegerField()
    subtotal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.JSONField(default=dict)
    billing_address = models.JSONField(default=dict, null=True, blank=True)
    status = models.CharField(
        max_length=255, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=255, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    coupon_code_applied = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Order #{self.order_number} by {self.shipping_address.get('full_name')}"

    class Meta(BaseModel.Meta):
        unique_together = ("order_number", "customer")
        indexes = [
            models.Index(fields=["order_number"], name="idx_order_number"),
            models.Index(fields=["customer"], name="idx_order_customer"),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{self.id}"
        super().save(*args, **kwargs)


class OrderItem(BaseModel):
    order = models.ForeignKey("Order", on_delete=models.CASCADE)
    variant = models.ForeignKey("ProductVariant", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # product_snapshot = product, variant, current price, sku
    product_snapshot = models.JSONField(default=dict)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    vendor = models.ForeignKey("Vendor", on_delete=models.SET_NULL, null=True)

    is_refunded = models.BooleanField(default=False)
    fulfillment_status = models.CharField(
        max_length=255, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )

    shipped_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)

    vendor_payout_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    vendor_payout_status = models.CharField(
        max_length=255, choices=PaymentStatus.choices, default=OrderStatus.PENDING
    )
    tracking_number = models.CharField(max_length=255, null=True, blank=True)

    class Meta(BaseModel.Meta):
        unique_together = ("order", "variant")
        indexes = [
            models.Index(fields=["order"], name="idx_order_item_order"),
            models.Index(fields=["variant"], name="idx_order_item_variant"),
        ]

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.variant_name}"
