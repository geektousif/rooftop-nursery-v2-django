from django.db import models

from core.models import BaseModel


# Create your models here.
class ProductImage(BaseModel):
    # TODO: add background job for image cleanup after product deletion
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        related_name="images",
    )
    image_url = models.URLField()
    image_provider_id = models.CharField(max_length=255, blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    is_display_image = models.BooleanField(default=False)
    # display_order = models.PositiveIntegerField()

    class Meta(BaseModel.Meta):
        # unique_together = ["variant", "is_display_image"]
        indexes = [
            models.Index(fields=["variant", "is_display_image"]),
        ]
        ordering = ["variant", "is_display_image"]

    def __str__(self):
        if self.variant:
            return f"Image for {self.variant.product.name} - {self.variant.name}"
        return f"Image (ID: {self.id})"
