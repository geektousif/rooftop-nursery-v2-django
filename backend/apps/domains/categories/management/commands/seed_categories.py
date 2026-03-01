from django.core.management.base import BaseCommand

from apps.categories.models import Category


class Command(BaseCommand):
    help = "Seed categories data"

    def handle(self, *args, **options):
        self.stdout.write("Creating categories...")

        categories_data = [
            {
                "name": "Electronics",
                "slug": "electronics",
                "code": "ELEC",
                "is_active": True,
                "children": [
                    {
                        "name": "Mobile Phones",
                        "slug": "mobile-phones",
                        "code": "MOBILE",
                        "is_active": True,
                    },
                    {
                        "name": "Laptops",
                        "slug": "laptops",
                        "code": "LAPTOP",
                        "is_active": True,
                    },
                    {
                        "name": "Accessories",
                        "slug": "electronics-accessories",
                        "code": "ELEC_ACC",
                        "is_active": True,
                    },
                ],
            },
            {
                "name": "Fashion",
                "slug": "fashion",
                "code": "FASH",
                "is_active": True,
                "children": [
                    {
                        "name": "Men's Clothing",
                        "slug": "mens-clothing",
                        "code": "MEN_CLOTH",
                        "is_active": True,
                    },
                    {
                        "name": "Women's Clothing",
                        "slug": "womens-clothing",
                        "code": "WOMEN_CLOTH",
                        "is_active": True,
                    },
                    {
                        "name": "Footwear",
                        "slug": "footwear",
                        "code": "FOOT",
                        "is_active": True,
                    },
                ],
            },
            {
                "name": "Home & Kitchen",
                "slug": "home-kitchen",
                "code": "HOME",
                "is_active": True,
                "children": [
                    {
                        "name": "Furniture",
                        "slug": "furniture",
                        "code": "FURN",
                        "is_active": True,
                    },
                    {
                        "name": "Kitchen Appliances",
                        "slug": "kitchen-appliances",
                        "code": "KITCHEN",
                        "is_active": True,
                    },
                ],
            },
            {
                "name": "Books",
                "slug": "books",
                "code": "BOOKS",
                "is_active": True,
            },
            {
                "name": "Sports & Outdoors",
                "slug": "sports-outdoors",
                "code": "SPORTS",
                "is_active": True,
            },
        ]

        created_count = 0
        for cat_data in categories_data:
            children = cat_data.pop("children", [])
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"], defaults=cat_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {category.name}")
                )

            # Create children
            for child_data in children:
                child, child_created = Category.objects.get_or_create(
                    slug=child_data["slug"],
                    defaults={**child_data, "parent": category},
                )
                if child_created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"Created subcategory: {child.name}")
                    )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} categories")
        )
        self.stdout.write(self.style.SUCCESS("Categories seeding completed!"))