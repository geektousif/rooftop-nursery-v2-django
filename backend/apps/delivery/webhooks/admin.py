from django.contrib import admin

from .models import WebhookEvents


@admin.register(WebhookEvents)
class WebhookEventsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "event_type",
        "processed",
        "created_at",
    )
    list_filter = ("processed", "event_type", "created_at")
    search_fields = ("event_type", "processing_error")
    readonly_fields = ("id", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("id", "event_type")}),
        ("Payload", {"fields": ("payload",)}),
        ("Processing", {"fields": ("processed", "processing_error")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
