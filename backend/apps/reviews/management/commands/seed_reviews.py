from django.core.management.base import BaseCommand

from apps.reviews.models import ProductReview
from apps.products.models import Product
from apps.customers.models import Customer


class Command(BaseCommand):
    help = "Seed product reviews data"

    def handle(self, *args, **options):
        self.stdout.write("Creating product reviews...")

        products = Product.objects.all()
        customers = Customer.objects.filter(is_active=True)

        if not products.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No products found. Please run seed_products first."
                )
            )
            return

        if not customers.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No customers found. Please run seed_customers first."
                )
            )
            return

        reviews_data = [
            {
                "rating": 5,
                "comment": "Excellent product!",
                "body": "This product exceeded my expectations. Highly recommended!",
                "is_verified": True,
            },
            {
                "rating": 4,
                "comment": "Good quality",
                "body": "Good quality product, worth the price. Delivery was fast.",
                "is_verified": True,
            },
            {
                "rating": 5,
                "comment": "Amazing!",
                "body": "Love this product. Will definitely buy again.",
                "is_verified": False,
            },
            {
                "rating": 3,
                "comment": "Average",
                "body": "Product is okay, but could be better.",
                "is_verified": False,
            },
        ]

        created_count = 0
        for product in products[:5]:  # Limit to first 5 products
            for idx, review_data in enumerate(reviews_data[:2]):  # 2 reviews per product
                customer = customers[idx % customers.count()] if customers.exists() else None
                if not customer:
                    continue

                review, created = ProductReview.objects.get_or_create(
                    product=product,
                    customer=customer,
                    defaults={
                        **review_data,
                        "reviewer_name": customer.user.full_name if customer.user else "Anonymous",
                    },
                )
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created review for {product.name} by {review.reviewer_name}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} reviews")
        )
        self.stdout.write(self.style.SUCCESS("Reviews seeding completed!"))