from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed all data in the correct order"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-existing",
            action="store_true",
            help="Skip seeding if data already exists",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting database seeding..."))
        self.stdout.write("=" * 50)

        commands = [
            ("seed_users", "Users"),
            # ("seed_categories", "Categories"),
            ("seed_vendors", "Vendors"),
            ("seed_products", "Products"),
            ("seed_images", "Product Images"),
            ("seed_inventory", "Inventory"),
            ("seed_customers", "Customers"),
            ("seed_coupons", "Coupons"),
            ("seed_storefront", "Storefront"),
            ("seed_reviews", "Reviews"),
            ("seed_orders", "Orders"),
            ("seed_payments", "Payments"),
            ("seed_webhooks", "Webhooks"),
        ]

        for command_name, display_name in commands:
            try:
                self.stdout.write(f"\nSeeding {display_name}...")
                call_command(command_name)
                self.stdout.write(self.style.SUCCESS(f"✓ {display_name} seeded successfully"))
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Error seeding {display_name}: {str(e)}")
                )
                if not options.get("skip_existing", False):
                    raise

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("Database seeding completed!"))