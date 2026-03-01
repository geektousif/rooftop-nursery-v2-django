import random

from django.db import models
from django.utils.text import slugify
from treenode.models import TreeNodeModel

from core.models import BaseModel


# Create your models here.
class Category(TreeNodeModel, BaseModel):  # type: ignore
    display_field = "name"

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
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

    def save(self, *args, **kwargs):
        if not self.slug:
            # check uniqueness first
            slug = slugify(self.name)
            if not Category.objects.filter(slug=slug).exists():
                self.slug = slug
            elif self.parent:
                self.slug = f"{self.parent.slug}-{slug}"
            else:
                self.slug = f"{slug}-{random.randint(1, 1000)}"

        super().save(*args, **kwargs)
