from django.contrib import admin
from treenode.admin import TreeNodeModelAdmin

from apps.categories.models import Category


# Register your models here.
@admin.register(Category)
class CategoryAdmin(TreeNodeModelAdmin):
    list_display = ('id', 'name', 'parent')
    search_fields = ("name",)
    