from django.core.management.base import BaseCommand

from apps.images.models import ProductImage
from apps.products.models import ProductVariant


class Command(BaseCommand):
    help = "Seed product images data"

    def handle(self, *args, **options):
        self.stdout.write("Creating product images...")

        variants = ProductVariant.objects.all()
        if not variants.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No product variants found. Please run seed_products first."
                )
            )
            return

        # Sample image URLs (using placeholder service)
        image_urls = [
            "https://via.placeholder.com/800x600/000000/FFFFFF?text=Product+Image+1",
            "https://via.placeholder.com/800x600/333333/FFFFFF?text=Product+Image+2",
            "https://via.placeholder.com/800x600/666666/FFFFFF?text=Product+Image+3",
        ]

        created_count = 0
        for variant in variants[:10]:  # Limit to first 10 variants
            for idx, image_url in enumerate(image_urls[:2]):  # 2 images per variant
                image, created = ProductImage.objects.get_or_create(
                    variant=variant,
                    display_order=idx + 1,
                    defaults={
                        "image_url": image_url,
                        "is_display_image": idx == 0,
                        "image_provider_id": f"img_{variant.id}_{idx}",
                    },
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} product images")
        )
        self.stdout.write(self.style.SUCCESS("Product images seeding completed!"))