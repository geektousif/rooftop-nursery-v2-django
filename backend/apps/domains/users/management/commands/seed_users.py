from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import User


class Command(BaseCommand):
    help = "Seed users data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=10,
            help="Number of users to create",
        )

    def handle(self, *args, **options):
        count = options["count"]
        self.stdout.write(f"Creating {count} users...")

        # Create super admin
        if not User.objects.filter(email="admin@example.com").exists():
            User.objects.create_user(
                email="admin@example.com",
                phone="+919999999999",
                full_name="Super Admin",
                role=User.UserRoles.SUPER_ADMIN,
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(self.style.SUCCESS("Created super admin user"))

        # Create admin user
        if not User.objects.filter(email="admin2@example.com").exists():
            User.objects.create_user(
                email="admin2@example.com",
                phone="+919999999998",
                full_name="Admin User",
                role=User.UserRoles.ADMIN,
                is_staff=True,
            )
            self.stdout.write(self.style.SUCCESS("Created admin user"))

        # Create vendor users
        for i in range(1, 4):
            email = f"vendor{i}@example.com"
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(
                    email=email,
                    phone=f"+91999999999{i}",
                    full_name=f"Vendor {i}",
                    role=User.UserRoles.VENDOR,
                )
                self.stdout.write(self.style.SUCCESS(f"Created vendor user: {email}"))

        # Create customer users
        created = 0
        for i in range(1, count + 1):
            email = f"customer{i}@example.com"
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(
                    email=email,
                    phone=f"+91988888888{i:02d}",
                    full_name=f"Customer {i}",
                    role=User.UserRoles.CUSTOMER,
                )
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created} customer users")
        )
        self.stdout.write(self.style.SUCCESS("Users seeding completed!"))