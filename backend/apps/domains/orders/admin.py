from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("id", "created_at")
    fields = (
        "variant",
        "quantity",
        "unit_price",
        "tax_amount",
        "discount_amount",
        "total_amount",
        "vendor",
        "fulfillment_status",
        "is_refunded",
        "tracking_number",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_number",
        "customer",
        "status",
        "payment_status",
        "grand_total",
        "total_quantity",
        "created_at",
    )
    list_filter = (
        "status",
        "payment_status",
        "created_at",
        "confirmed_at",
        "shipped_at",
        "delivered_at",
    )
    search_fields = (
        "order_number",
        "customer__user__email",
        "customer__user__phone",
        "shipping_address",
        "billing_address",
        "coupon_code_applied",
    )
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("id", "order_number", "customer")}),
        (
            "Amounts",
            {
                "fields": (
                    "total_quantity",
                    "subtotal_amount",
                    "tax_amount",
                    "shipping_amount",
                    "discount_amount",
                    "grand_total",
                )
            },
        ),
        ("Addresses", {"fields": ("shipping_address", "billing_address")}),
        ("Status", {"fields": ("status", "payment_status")}),
        ("Coupon", {"fields": ("coupon_code_applied",)}),
        ("Notes", {"fields": ("notes",)}),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                    "confirmed_at",
                    "shipped_at",
                    "delivered_at",
                    "cancelled_at",
                )
            },
        ),
        ("Cancellation", {"fields": ("cancellation_reason",)}),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "variant",
        "quantity",
        "unit_price",
        "total_amount",
        "fulfillment_status",
        "is_refunded",
        "created_at",
    )
    list_filter = ("fulfillment_status", "is_refunded", "vendor_payout_status", "created_at")
    search_fields = (
        "order__order_number",
        "variant__product__name",
        "variant__name",
        "variant__sku",
        "tracking_number",
    )
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
        "shipped_at",
        "delivered_at",
        "cancelled_at",
    )

    fieldsets = (
        (None, {"fields": ("id", "order", "variant", "vendor")}),
        (
            "Quantity & Pricing",
            {"fields": ("quantity", "unit_price", "tax_amount", "discount_amount", "total_amount")},
        ),
        ("Product Snapshot", {"fields": ("product_snapshot",)}),
        ("Fulfillment", {"fields": ("fulfillment_status", "tracking_number", "is_refunded")}),
        ("Vendor Payout", {"fields": ("vendor_payout_amount", "vendor_payout_status")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at", "shipped_at", "delivered_at", "cancelled_at")},
        ),
        ("Cancellation", {"fields": ("cancellation_reason",)}),
    )
