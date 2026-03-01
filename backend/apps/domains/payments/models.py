from django.db import models

from apps.domains.orders.models import PaymentStatus
from shared.models import BaseModel


# Create your models here.
class Payment(BaseModel):
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE)
    gateway_order_id = models.CharField(max_length=255)
    gateway_transaction_id = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    gateway_response = models.JSONField()
    failure_reason = models.TextField(null=True, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    idempotency_key = models.CharField(max_length=255, unique=True)
    attempt_count = models.PositiveIntegerField(default=1)
    last_attempted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.idempotency_key:
            self.idempotency_key = self.generate_idempotency_key()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_idempotency_key():
        import uuid

        return str(uuid.uuid4())

    class Meta(BaseModel.Meta):
        unique_together = ("order", "gateway_order_id")
        indexes = [
            models.Index(fields=["order"], name="idx_payment_order"),
            models.Index(fields=["gateway_order_id"], name="idx_payment_gateway_order_id"),
        ]
