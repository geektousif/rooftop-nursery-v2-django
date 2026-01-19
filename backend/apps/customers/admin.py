from django.contrib import admin

from apps.customers.models import Address, Customer


class AddressInline(admin.TabularInline):
    model = Address
    extra = 1
    fields = (
        "type",
        "full_name",
        "phone",
        "email",
        "address",
        "city",
        "state",
        "country",
        "pin_code",
        "is_default",
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "is_active",
        "is_guest",
        "created_at",
    )
    list_filter = ("is_active", "is_guest", "created_at")
    search_fields = ("user__email", "user__phone", "user__full_name")
    readonly_fields = ("id", "created_at", "updated_at")
    inlines = [AddressInline]

    fieldsets = (
        (None, {"fields": ("id", "user")}),
        ("Status", {"fields": ("is_active", "is_guest")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "type",
        "full_name",
        "phone",
        "city",
        "state",
        "pin_code",
        "is_default",
        "created_at",
    )
    list_filter = ("type", "is_default", "country", "state", "created_at")
    search_fields = (
        "full_name",
        "phone",
        "email",
        "address",
        "city",
        "state",
        "pin_code",
        "customer__user__email",
    )
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("id", "customer", "type")}),
        ("Contact Info", {"fields": ("full_name", "phone", "email")}),
        ("Address", {"fields": ("address", "city", "state", "country", "pin_code")}),
        ("Settings", {"fields": ("is_default",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
