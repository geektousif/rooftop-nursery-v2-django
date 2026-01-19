from django.db import models

from apps.core.models import BaseModel


class Product(BaseModel):
    """
    Base Product (For Overview details only)
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    attributes = models.JSONField(default=dict)
    tags = models.JSONField(default=list)

    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.CASCADE)
    category = models.ManyToManyField("categories.Category", related_name="products")

    is_active = models.BooleanField(default=True)
    # is_featured = models.BooleanField(default=False)
    # TODO suggest in frontend
    # def save(self, *args, **kwargs):
    #     if not self.sku:
    #         self.sku = self.slug
    #     super().save(*args, **kwargs)

    # create base variant

    class Meta(BaseModel.Meta):
        unique_together = ["name", "vendor"]
        indexes = [
            models.Index(fields=["name", "vendor"], name="idx_product_name_vendor"),
            models.Index(fields=["is_active"], name="idx_product_is_active"),
        ]

    def __str__(self):
        return self.name


class ProductVariant(BaseModel):
    """
    Sellable Entities
    """

    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)  # Compared Price
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # For Internal Profit Calculation
    display_order = models.PositiveIntegerField()
    weight_grams = models.PositiveIntegerField()
    unit = models.CharField(max_length=255)
    unit_value = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    is_single_unit = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        unique_together = ["product", "sku"]
        indexes = [
            models.Index(fields=["product", "sku"], name="idx_product_variant_sku"),
            models.Index(fields=["is_active"], name="idx_product_variant_is_active"),
            models.Index(
                fields=["product", "display_order"],
                name="idx_product_image_order",
            ),
            models.Index(fields=["product"], name="idx_product_variant_product"),
        ]

    # def save(self, *args, **kwargs):
    #     if self.is_single_unit:
    #         if ProductVariant.objects.filter(product=self.product).count() >= 1:
    #             return

    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}"
