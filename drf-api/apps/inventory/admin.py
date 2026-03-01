from django.contrib import admin

from .models import Stock


# Register your models here.
@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "variant",
        "quantity",
        "reserved_quantity",
        "available_quantity",
        "low_stock_threshold",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = ("variant__product__name", "variant__name", "variant__sku")
    readonly_fields = ("id", "available_quantity", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("id", "variant")}),
        (
            "Stock Info",
            {
                "fields": (
                    "quantity",
                    "reserved_quantity",
                    "available_quantity",
                    "low_stock_threshold",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
