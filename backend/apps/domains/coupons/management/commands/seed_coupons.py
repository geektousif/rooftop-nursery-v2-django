from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.coupons.models import Coupon


class Command(BaseCommand):
    help = "Seed coupons data"

    def handle(self, *args, **options):
        self.stdout.write("Creating coupons...")

        start_date = timezone.now()
        end_date = start_date + timedelta(days=90)

        coupons_data = [
            {
                "code": "WELCOME10",
                "description": "Welcome discount for new customers",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": 10.0,
                "min_order_amount": 500.0,
                "max_discount_amount": 500.0,
                "usage_limit": 1000,
                "usage_limit_per_user": 1,
                "applies_to_all_products": True,
            },
            {
                "code": "FLAT50",
                "description": "Flat 50 rupees off",
                "discount_type": Coupon.DiscountType.FIXED,
                "discount_value": 50.0,
                "min_order_amount": 1000.0,
                "max_discount_amount": None,
                "usage_limit": 500,
                "usage_limit_per_user": 3,
                "applies_to_all_products": True,
            },
            {
                "code": "SUMMER25",
                "description": "Summer sale 25% off",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": 25.0,
                "min_order_amount": 2000.0,
                "max_discount_amount": 1000.0,
                "usage_limit": 200,
                "usage_limit_per_user": 2,
                "applies_to_all_products": False,
            },
        ]

        created_count = 0
        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data["code"],
                defaults={
                    **coupon_data,
                    "start_date": start_date,
                    "end_date": end_date,
                    "is_active": True,
                },
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created coupon: {coupon.code}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} coupons")
        )
        self.stdout.write(self.style.SUCCESS("Coupons seeding completed!"))