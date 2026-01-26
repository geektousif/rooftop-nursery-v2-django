from django.contrib import admin
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from apps.images.forms import ProductImageForm
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


class ProductImageInline(TabularInline):
    """Inline for managing product images"""

    model = ProductImage
    form = ProductImageForm
    extra = 1  # Start with 1 empty form
    fields = [
        # "image_upload",
        "image_url",
        "image_provider_id",
        "is_display_image",
        "display_order",
        "image_preview",
    ]
    readonly_fields = ["image_preview"]

    @display(description="Preview")
    def image_preview(self, obj):
        if obj.image_url:
            # ImageKit transformation for thumbnails
            # thumb_url = obj.image_url.replace("/tr:", "/tr:w-100,h-100,c-at_max/")
            thumb_url = f"{obj.image_url}?tr=w-100,h-100,c-at_max"
            return mark_safe(
                f'<img src="{thumb_url}" style="max-width: 100px; border-radius: 8px;" />'
            )
        return "-"


    def get_formset(self, request, obj=None, **kwargs):
        FormSet = super().get_formset(request, obj, **kwargs)

        class ProductImageFormSet(FormSet):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)

                product_name = obj.product.name if obj else ""
                variant_name = obj.name if obj else ""
                file_name_attrs = {
                    "product_name": product_name,
                    "variant_name": variant_name,
                }

                for form in self.forms:
                    # We attach the name to the form class dynamically
                    form.fields["image_url"].widget.attrs.update(file_name_attrs)

                # self.empty_form.parent_product_name = product_name

                 # 🔑 future "Add another" forms
                self.form.base_fields["image_url"].widget.attrs.update(file_name_attrs)
                print(self.empty_form.fields["image_url"].widget.attrs)

        return ProductImageFormSet  # 🔑 inject product


    # class Media:
    #     js = ("admin/js/imagekit_inline.js",)  # Auto-add new row after upload
