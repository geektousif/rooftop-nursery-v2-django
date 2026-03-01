from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import User
from apps.vendors.models import Vendor


class Command(BaseCommand):
    help = "Seed vendors data"

    def handle(self, *args, **options):
        self.stdout.write("Creating vendors...")

        vendor_users = User.objects.filter(role=User.UserRoles.VENDOR)
        if not vendor_users.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No vendor users found. Please run seed_users first."
                )
            )
            return

        vendor_data = [
            {
                "business_name": "Tech Solutions Inc",
                "commission_rate": 10.00,
                "is_approved": True,
            },
            {
                "business_name": "Fashion Hub",
                "commission_rate": 12.50,
                "is_approved": True,
            },
            {
                "business_name": "Home Essentials",
                "commission_rate": 8.00,
                "is_approved": False,
            },
        ]

        created_count = 0
        for i, vendor_info in enumerate(vendor_data):
            user = vendor_users[i] if i < vendor_users.count() else None
            if not user:
                continue

            vendor, created = Vendor.objects.get_or_create(
                user=user,
                defaults={
                    **vendor_info,
                    "approved_at": timezone.now() if vendor_info["is_approved"] else None,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created vendor: {vendor.business_name}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} vendors")
        )
        self.stdout.write(self.style.SUCCESS("Vendors seeding completed!"))