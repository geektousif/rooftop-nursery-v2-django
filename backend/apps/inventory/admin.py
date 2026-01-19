from django.contrib import admin

from apps.inventory.models import InventoryLog, Stock


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
        ("Stock Info", {"fields": ("quantity", "reserved_quantity", "available_quantity", "low_stock_threshold")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "variant",
        "action_type",
        "change_quantity",
        "previous_quantity",
        "current_quantity",
        "reference_type",
        "created_at",
    )
    list_filter = ("action_type", "reference_type", "created_at")
    search_fields = (
        "variant__product__name",
        "variant__name",
        "variant__sku",
        "reference_id",
        "reference_type",
    )
    readonly_fields = (
        "id",
        "current_quantity",
        "created_at",
        "updated_at",
    )
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("id", "variant", "action_type")}),
        ("Quantity Changes", {"fields": ("change_quantity", "previous_quantity", "current_quantity")}),
        ("Reference", {"fields": ("reference_id", "reference_type")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
