from django.core.management.base import BaseCommand

from apps.webhooks.models import WebhookEvents


class Command(BaseCommand):
    help = "Seed webhook events data"

    def handle(self, *args, **options):
        self.stdout.write("Creating webhook events...")

        webhook_events_data = [
            {
                "event_type": "order.created",
                "payload": {
                    "order_id": "123e4567-e89b-12d3-a456-426614174000",
                    "order_number": "ORD-20240101-0001",
                    "customer_id": "123e4567-e89b-12d3-a456-426614174001",
                    "total_amount": "1500.00",
                },
                "processed": True,
            },
            {
                "event_type": "payment.success",
                "payload": {
                    "payment_id": "pay_1234567890",
                    "order_id": "123e4567-e89b-12d3-a456-426614174000",
                    "amount": "1500.00",
                    "gateway": "razorpay",
                },
                "processed": True,
            },
            {
                "event_type": "order.shipped",
                "payload": {
                    "order_id": "123e4567-e89b-12d3-a456-426614174000",
                    "tracking_number": "TRACK123456",
                    "carrier": "FedEx",
                },
                "processed": False,
            },
        ]

        created_count = 0
        for event_data in webhook_events_data:
            event, created = WebhookEvents.objects.get_or_create(
                event_type=event_data["event_type"],
                defaults=event_data,
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created webhook event: {event.event_type}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} webhook events")
        )
        self.stdout.write(self.style.SUCCESS("Webhook events seeding completed!"))