from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.products.models import Product, ProductVariant
from apps.categories.models import Category
from apps.vendors.models import Vendor


class Command(BaseCommand):
    help = "Seed products data"

    def handle(self, *args, **options):
        self.stdout.write("Creating products...")

        vendors = Vendor.objects.filter(is_approved=True)
        if not vendors.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No approved vendors found. Please run seed_vendors first."
                )
            )
            return

        categories = Category.objects.filter(is_active=True)
        if not categories.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No categories found. Please run seed_categories first."
                )
            )
            return

        products_data = [
            {
                "name": "Smartphone Pro Max",
                "slug": "smartphone-pro-max",
                "description": "Latest smartphone with advanced features and high-quality camera.",
                "attributes": {"brand": "TechBrand", "color": "Black", "storage": "128GB"},
                "tags": ["smartphone", "mobile", "tech"],
                "categories": ["mobile-phones"],
                "variants": [
                    {
                        "name": "128GB Black",
                        "sku": "SPM-128-BLK",
                        "price": Decimal("29999.00"),
                        "mrp": Decimal("34999.00"),
                        "cost_price": Decimal("25000.00"),
                        "display_order": 1,
                        "weight_grams": 200,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                    {
                        "name": "256GB Black",
                        "sku": "SPM-256-BLK",
                        "price": Decimal("34999.00"),
                        "mrp": Decimal("39999.00"),
                        "cost_price": Decimal("30000.00"),
                        "display_order": 2,
                        "weight_grams": 200,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                ],
            },
            {
                "name": "Laptop Ultra",
                "slug": "laptop-ultra",
                "description": "High-performance laptop for professionals and gamers.",
                "attributes": {"brand": "TechBrand", "processor": "Intel i7", "ram": "16GB"},
                "tags": ["laptop", "computer", "tech"],
                "categories": ["laptops"],
                "variants": [
                    {
                        "name": "16GB RAM 512GB SSD",
                        "sku": "LAP-16-512",
                        "price": Decimal("69999.00"),
                        "mrp": Decimal("79999.00"),
                        "cost_price": Decimal("60000.00"),
                        "display_order": 1,
                        "weight_grams": 2000,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                ],
            },
            {
                "name": "Cotton T-Shirt",
                "slug": "cotton-t-shirt",
                "description": "Comfortable cotton t-shirt for everyday wear.",
                "attributes": {"material": "Cotton", "fit": "Regular"},
                "tags": ["clothing", "tshirt", "casual"],
                "categories": ["mens-clothing"],
                "variants": [
                    {
                        "name": "Small",
                        "sku": "TSH-S",
                        "price": Decimal("499.00"),
                        "mrp": Decimal("699.00"),
                        "cost_price": Decimal("300.00"),
                        "display_order": 1,
                        "weight_grams": 150,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                    {
                        "name": "Medium",
                        "sku": "TSH-M",
                        "price": Decimal("499.00"),
                        "mrp": Decimal("699.00"),
                        "cost_price": Decimal("300.00"),
                        "display_order": 2,
                        "weight_grams": 150,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                    {
                        "name": "Large",
                        "sku": "TSH-L",
                        "price": Decimal("499.00"),
                        "mrp": Decimal("699.00"),
                        "cost_price": Decimal("300.00"),
                        "display_order": 3,
                        "weight_grams": 150,
                        "unit": "piece",
                        "unit_value": Decimal("1.00"),
                    },
                ],
            },
        ]

        created_count = 0
        variant_count = 0

        for product_data in products_data:
            vendor = vendors.first()
            category_slugs = product_data.pop("categories", [])
            variants_data = product_data.pop("variants", [])

            product, created = Product.objects.get_or_create(
                slug=product_data["slug"],
                defaults={**product_data, "vendor": vendor},
            )

            if created:
                created_count += 1
                # Add categories
                for slug in category_slugs:
                    try:
                        category = Category.objects.get(slug=slug)
                        product.category.add(category)
                    except Category.DoesNotExist:
                        pass

                self.stdout.write(
                    self.style.SUCCESS(f"Created product: {product.name}")
                )

                # Create variants
                for variant_data in variants_data:
                    variant, v_created = ProductVariant.objects.get_or_create(
                        sku=variant_data["sku"],
                        defaults={**variant_data, "product": product},
                    )
                    if v_created:
                        variant_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"  Created variant: {variant.name} ({variant.sku})"
                            )
                        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {created_count} products and {variant_count} variants"
            )
        )
        self.stdout.write(self.style.SUCCESS("Products seeding completed!"))