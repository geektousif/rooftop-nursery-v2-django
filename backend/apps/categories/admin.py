from django.contrib import admin
from treenode.admin import TreeNodeModelAdmin
from unfold.admin import ModelAdmin

from .models import Category


@admin.register(Category)
class CategoryAdmin(TreeNodeModelAdmin, ModelAdmin):
    treenode_display_mode = TreeNodeModelAdmin.TREENODE_DISPLAY_MODE_ACCORDION
    list_display = ("id", "name", "slug", "code", "is_active", "created_at")
    search_fields = ("name", "slug", "code")
    readonly_fields = ("id", "created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}
