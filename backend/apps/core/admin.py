from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from django.forms import CheckboxSelectMultiple
from unfold.admin import ModelAdmin

admin.site.unregister(Group)


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    # 1. Keep your widget override
    formfield_overrides = {
        Group._meta.get_field("permissions"): {
            "widget": CheckboxSelectMultiple(
                attrs={
                    # Make the widget itself (the list of checkboxes) scrollable and tall
                    "class": "h-full w-full overflow-y-auto border border-base-200 rounded-md p-4"
                }
            ),
        },
    }

    # 2. Inject CSS to force the containers to expand
    class Media:
        css = {"all": ("css/admin/group_permissions_full_height.css",)}
