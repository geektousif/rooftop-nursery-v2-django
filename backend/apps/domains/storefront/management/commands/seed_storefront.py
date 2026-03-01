from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.storefront.models import Banner, StorefrontSetting


class Command(BaseCommand):
    help = "Seed storefront data"

    def handle(self, *args, **options):
        self.stdout.write("Creating storefront data...")

        # Create banners
        start_date = timezone.now()
        end_date = start_date + timedelta(days=30)

        banners_data = [
            {
                "title": "Summer Sale",
                "image_url": "https://via.placeholder.com/1920x600/FF6B6B/FFFFFF?text=Summer+Sale",
                "mobile_image_url": "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Summer+Sale",
                "link_url": "/products?category=summer",
                "position_type": Banner.PositionType.HERO_SLIDER,
                "sort_order": 1,
            },
            {
                "title": "New Arrivals",
                "image_url": "https://via.placeholder.com/1920x600/4ECDC4/FFFFFF?text=New+Arrivals",
                "mobile_image_url": "https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=New+Arrivals",
                "link_url": "/products?new=true",
                "position_type": Banner.PositionType.HERO_SLIDER,
                "sort_order": 2,
            },
            {
                "title": "Special Offer",
                "image_url": "https://via.placeholder.com/300x250/95E1D3/FFFFFF?text=Special+Offer",
                "link_url": "/products?offer=true",
                "position_type": Banner.PositionType.SIDEBAR_AD,
                "sort_order": 1,
            },
        ]

        banner_count = 0
        for banner_data in banners_data:
            banner, created = Banner.objects.get_or_create(
                title=banner_data["title"],
                position_type=banner_data["position_type"],
                defaults={
                    **banner_data,
                    "start_date": start_date,
                    "end_date": end_date,
                    "is_active": True,
                },
            )
            if created:
                banner_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created banner: {banner.title}")
                )

        # Create storefront settings
        settings_data = [
            {
                "key": "site_title",
                "value": "My E-Commerce Store",
                "type": "string",
                "description": "Website title",
            },
            {
                "key": "support_phone",
                "value": "+91-1800-123-4567",
                "type": "string",
                "description": "Customer support phone number",
            },
            {
                "key": "tax_rate",
                "value": "18",
                "type": "number",
                "description": "Default tax rate percentage",
            },
            {
                "key": "shipping_threshold",
                "value": "500",
                "type": "number",
                "description": "Minimum order amount for free shipping",
            },
            {
                "key": "free_shipping_enabled",
                "value": "true",
                "type": "boolean",
                "description": "Enable free shipping",
            },
        ]

        setting_count = 0
        for setting_data in settings_data:
            setting, created = StorefrontSetting.objects.get_or_create(
                key=setting_data["key"],
                defaults={**setting_data, "is_active": True},
            )
            if created:
                setting_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created setting: {setting.key}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {banner_count} banners and {setting_count} settings"
            )
        )
        self.stdout.write(self.style.SUCCESS("Storefront seeding completed!"))