from django.contrib import admin

from apps.reviews.models import ProductReview


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "customer",
        "reviewer_name",
        "rating",
        "is_verified",
        "created_at",
    )
    list_filter = ("rating", "is_verified", "created_at")
    search_fields = (
        "product__name",
        "customer__user__email",
        "reviewer_name",
        "comment",
        "body",
    )
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("id", "product", "customer")}),
        ("Review", {"fields": ("reviewer_name", "rating", "comment", "body")}),
        ("Verification", {"fields": ("is_verified",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
