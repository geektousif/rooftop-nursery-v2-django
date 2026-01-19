from django.core.management.base import BaseCommand

from apps.inventory.models import Stock
from apps.products.models import ProductVariant


class Command(BaseCommand):
    help = "Seed inventory data"

    def handle(self, *args, **options):
        self.stdout.write("Creating inventory stock...")

        variants = ProductVariant.objects.all()
        if not variants.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No product variants found. Please run seed_products first."
                )
            )
            return

        created_count = 0
        for variant in variants:
            stock, created = Stock.objects.get_or_create(
                variant=variant,
                defaults={
                    "quantity": 100,
                    "reserved_quantity": 0,
                    "low_stock_threshold": 10,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created stock for {variant.product.name} - {variant.name}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} stock records")
        )
        self.stdout.write(self.style.SUCCESS("Inventory seeding completed!"))