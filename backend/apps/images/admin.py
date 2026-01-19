from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.images.models import ProductImage


@admin.register(ProductImage)
class ProductImageAdmin(ModelAdmin):
    list_display = (
        "id",
        "variant",
        "is_display_image",
        "display_order",
        "created_at",
    )
    list_filter = ("is_display_image", "created_at")
    search_fields = ("variant__product__name", "variant__name", "image_url")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("variant", "display_order")

    fieldsets = (
        (None, {"fields": ("id", "variant")}),
        ("Image", {"fields": ("image_url", "image_provider_id")}),
        ("Display", {"fields": ("is_display_image", "display_order")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
