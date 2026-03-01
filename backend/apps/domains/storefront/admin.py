from django.contrib import admin

from .models import Banner, StorefrontSetting


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "position_type",
        "is_active",
        "sort_order",
        "start_date",
        "end_date",
        "created_at",
    )
    list_filter = ("position_type", "is_active", "start_date", "end_date", "created_at")
    search_fields = ("title", "link_url", "image_url")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("sort_order", "-created_at")

    fieldsets = (
        (None, {"fields": ("id", "title", "position_type")}),
        ("Images", {"fields": ("image_url", "mobile_image_url")}),
        ("Link", {"fields": ("link_url",)}),
        ("Schedule", {"fields": ("start_date", "end_date")}),
        ("Display", {"fields": ("sort_order", "is_active")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(StorefrontSetting)
class StorefrontSettingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "key",
        "type",
        "is_active",
        "created_at",
    )
    list_filter = ("type", "is_active", "created_at")
    search_fields = ("key", "description", "value")
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("id", "key", "type")}),
        ("Value", {"fields": ("value", "description")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
