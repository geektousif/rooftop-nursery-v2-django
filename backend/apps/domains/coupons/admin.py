from django.contrib import admin

from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "code",
        "discount_type",
        "discount_value",
        "min_order_amount",
        "max_discount_amount",
        "usage_limit",
        "usage_limit_per_user",
        "is_active",
        "start_date",
        "end_date",
        "created_at",
    )
    list_filter = (
        "discount_type",
        "is_active",
        "applies_to_all_products",
        "start_date",
        "end_date",
        "created_at",
    )
    search_fields = ("code", "description")
    readonly_fields = ("id", "created_at", "updated_at")
    filter_horizontal = ("applies_to_specific_products",)
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("id", "code", "description")}),
        (
            "Discount",
            {
                "fields": (
                    "discount_type",
                    "discount_value",
                    "min_order_amount",
                    "max_discount_amount",
                )
            },
        ),
        ("Usage Limits", {"fields": ("usage_limit", "usage_limit_per_user")}),
        ("Validity", {"fields": ("start_date", "end_date")}),
        ("Products", {"fields": ("applies_to_all_products", "applies_to_specific_products")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
