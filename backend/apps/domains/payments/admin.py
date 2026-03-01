from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "payment_method",
        "amount",
        "status",
        "gateway_order_id",
        "gateway_transaction_id",
        "paid_at",
        "created_at",
    )
    list_filter = ("status", "payment_method", "paid_at", "refunded_at", "created_at")
    search_fields = (
        "order__order_number",
        "gateway_order_id",
        "gateway_transaction_id",
        "idempotency_key",
        "failure_reason",
    )
    readonly_fields = (
        "id",
        "idempotency_key",
        "created_at",
        "updated_at",
        "paid_at",
        "refunded_at",
    )
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("id", "order", "idempotency_key")}),
        ("Payment Details", {"fields": ("payment_method", "amount", "status")}),
        (
            "Gateway Info",
            {"fields": ("gateway_order_id", "gateway_transaction_id", "gateway_response")},
        ),
        ("Failure Info", {"fields": ("failure_reason",)}),
        ("Refund", {"fields": ("refund_amount", "refunded_at")}),
        ("Attempts", {"fields": ("attempt_count", "last_attempted_at")}),
        ("Timestamps", {"fields": ("created_at", "updated_at", "paid_at")}),
    )
