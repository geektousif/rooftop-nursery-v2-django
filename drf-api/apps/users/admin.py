from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.users.models import User


# Register your models here.
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "email", "phone", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "phone")
    ordering = ("id",)
    fieldsets = (
        (None, {"fields": ("email", "phone", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "role")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "phone", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )


admin.site.register(User, UserAdmin)
