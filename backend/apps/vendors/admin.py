from django.contrib import admin

from apps.vendors.models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "business_name",
        "user",
        "commission_rate",
        "is_approved",
        "approved_at",
        "created_at",
    )
    list_filter = ("is_approved", "commission_rate", "created_at", "approved_at")
    search_fields = ("business_name", "user__email", "user__phone", "user__full_name")
    readonly_fields = ("id", "created_at", "updated_at", "approved_at")

    fieldsets = (
        (None, {"fields": ("id", "user", "business_name")}),
        ("Commission", {"fields": ("commission_rate",)}),
        ("Approval", {"fields": ("is_approved", "approved_at")}),
        ("Platform Vendor", {"fields": ("is_platform_vendor",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def save_model(self, request, obj, form, change):
        if obj.is_approved and not obj.approved_at:
            from django.utils import timezone

            obj.approved_at = timezone.now()
        elif not obj.is_approved:
            obj.approved_at = None
        super().save_model(request, obj, form, change)
