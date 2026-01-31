from django.db import models
from treenode.models import TreeNodeModel

from core.models import BaseModel


# Create your models here.
class Category(TreeNodeModel, BaseModel):  # type: ignore
    display_field = "name"

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    code = models.CharField(max_length=255, unique=True)
    # parent_id = models.ForeignKey(
    #     "self", on_delete=models.SET_NULL, null=True, blank=True
    # )
    image_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta(TreeNodeModel.Meta):  # Preserve TreeNodeModel's indexing settings
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        # unique_together = ("slug", "parent")

    def __str__(self):
        return self.name
