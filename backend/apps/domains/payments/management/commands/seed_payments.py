from django.core.management.base import BaseCommand
from django.utils import timezone
import uuid

from apps.payments.models import Payment
from apps.orders.models import Order, PaymentStatus


class Command(BaseCommand):
    help = "Seed payments data"

    def handle(self, *args, **options):
        self.stdout.write("Creating payments...")

        orders = Order.objects.filter(payment_status=PaymentStatus.PAID)
        if not orders.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No paid orders found. Please run seed_orders first."
                )
            )
            return

        created_count = 0
        for order in orders:
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    "gateway_order_id": f"GATEWAY-{order.order_number}",
                    "gateway_transaction_id": f"TXN-{uuid.uuid4().hex[:16].upper()}",
                    "payment_method": "razorpay",
                    "amount": order.grand_total,
                    "status": PaymentStatus.PAID,
                    "gateway_response": {
                        "status": "success",
                        "payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                    },
                    "paid_at": timezone.now(),
                    "idempotency_key": str(uuid.uuid4()),
                    "attempt_count": 1,
                    "last_attempted_at": timezone.now(),
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created payment for order: {order.order_number}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} payments")
        )
        self.stdout.write(self.style.SUCCESS("Payments seeding completed!"))