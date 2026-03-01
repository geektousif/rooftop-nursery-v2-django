from django.core.management.base import BaseCommand

from apps.customers.models import Customer, Address
from apps.users.models import User


class Command(BaseCommand):
    help = "Seed customers data"

    def handle(self, *args, **options):
        self.stdout.write("Creating customers...")

        customer_users = User.objects.filter(role=User.UserRoles.CUSTOMER)
        if not customer_users.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No customer users found. Please run seed_users first."
                )
            )
            return

        created_count = 0
        address_count = 0

        for user in customer_users[:10]:  # Limit to first 10 customers
            customer, created = Customer.objects.get_or_create(
                user=user, defaults={"is_active": True, "is_guest": False}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created customer: {user.full_name}")
                )

                # Create default addresses
                shipping_address, addr_created = Address.objects.get_or_create(
                    customer=customer,
                    type=Address.AddressType.SHIPPING,
                    defaults={
                        "full_name": user.full_name,
                        "phone": user.phone,
                        "email": user.email,
                        "address": "123 Main Street",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "country": "India",
                        "pin_code": "400001",
                        "is_default": True,
                    },
                )
                if addr_created:
                    address_count += 1

                billing_address, addr_created = Address.objects.get_or_create(
                    customer=customer,
                    type=Address.AddressType.BILLING,
                    defaults={
                        "full_name": user.full_name,
                        "phone": user.phone,
                        "email": user.email,
                        "address": "123 Main Street",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "country": "India",
                        "pin_code": "400001",
                        "is_default": True,
                    },
                )
                if addr_created:
                    address_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {created_count} customers and {address_count} addresses"
            )
        )
        self.stdout.write(self.style.SUCCESS("Customers seeding completed!"))