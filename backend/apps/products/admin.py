from django.contrib import admin
from django.db import models
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.forms.widgets import WysiwygWidget
from unfold.decorators import display

from apps.images.admin import ProductImageInline
from apps.products.models import Product, ProductReview, ProductVariant


class ProductVariantInline(TabularInline):
    model = ProductVariant
    extra = 1
    fields = (
        "name",
        "sku",
        "price",
        "mrp",
        "cost_price",
        "display_order",
        "weight_grams",
        "unit",
        "unit_value",
        "is_active",
        "is_single_unit",
    )


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    formfield_overrides = {
        models.TextField: {
            "widget": WysiwygWidget,
        }
    }
    list_display = (
        "id",
        "name",
        "slug",
        "vendor",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "vendor", "created_at")
    search_fields = ("name", "slug", "description")
    readonly_fields = ("id", "created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("category",)
    inlines = [ProductVariantInline]

    fieldsets = (
        (None, {"fields": ("id", "name", "slug", "description")}),
        ("Relations", {"fields": ("vendor", "category")}),
        ("Metadata", {"fields": ("attributes", "tags")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(ModelAdmin):
    list_display = (
        "id",
        "product",
        "name",
        "sku",
        "price",
        "mrp",
        "cost_price",
        "display_order",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "is_single_unit", "product", "created_at")
    search_fields = ("name", "sku", "product__name")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("product", "display_order")
    inlines = [ProductImageInline]

    class Media:
        js = ("admin/js/imagekit_inline.js",)

    @display(description="Vendor", ordering="vendor__business_name")
    def vendor_name(self, obj):
        return obj.vendor.business_name

    @display(description="Categories")
    def category_display(self, obj):
        return ", ".join([c.name for c in obj.category.all()])

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("product", "product__vendor")
            .prefetch_related("product__category")
        )

    # fieldsets = (
    #     (None, {"fields": ("id", "product", "name", "sku")}),
    #     ("Pricing", {"fields": ("price", "mrp", "cost_price")}),
    #     (
    #         "Details",
    #         {"fields": ("display_order", "weight_grams", "unit", "unit_value")},
    #     ),
    #     ("Status", {"fields": ("is_active", "is_single_unit")}),
    #     ("Timestamps", {"fields": ("created_at", "updated_at")}),
    # )


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
