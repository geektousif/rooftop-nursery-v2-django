from datetime import datetime

from django.db import models
from django.utils.text import slugify

from core.models import BaseModel


class Product(BaseModel):
    """
    Base Product
    Logical product grouping (NOT directly sellable).
    Used for: Cataloging, grouping variants, SEO
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)

    attributes = models.JSONField(default=dict, null=True, blank=True)
    tags = models.JSONField(default=list, null=True, blank=True)

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
    )
    category = models.ManyToManyField("categories.Category", related_name="products")

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

    def save(self, *args, **kwargs):
        if not self.slug:
            # check uniqueness first
            slug = slugify(self.name)
            if not Product.objects.filter(slug=slug).exists():
                self.slug = slug
            else:
                self.slug = f"{slug}-{int(datetime.timestamp(datetime.now())):x}"  #
        super().save(*args, **kwargs)


class ProductVariant(BaseModel):
    """
    Sellable SKU (THIS is what customers buy).
    Example: "Lotus Bulb - Pink (1 piece)", "Tomato Seeds - Hybrid (50g)"
    """

    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="variants"
    )

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, unique=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)  # Compared Price
    # cost_price = models.DecimalField(
    #     max_digits=10, decimal_places=2, blank=True, null=True
    # )  # For Internal Profit Calculation

    # Variant attributes (color, size, weight)
    variant_attributes = models.JSONField(
        default=dict,
        help_text="""
        {
            "color": "Pink",
            "bloom_size": "Medium (5-7cm)",
            "flowering_season": "June-September",
            "sunlight": "Partial shade",
            "water_needs": "High",
            "mature_height": "30-40cm",
            "special_features": ["Fragrant", "Attracts butterflies"]
        }
        """,
    )

    weight_grams = models.PositiveIntegerField(null=True, blank=True)
    unit = models.CharField(max_length=255, blank=True, null=True)
    unit_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # display_order = models.PositiveIntegerField(null=True, blank=True)

    description = models.TextField(
        blank=True,
        null=True,
    )
    # is_featured = models.BooleanField(default=False)

    # ✅ ADD VARIANT-SPECIFIC ATTRIBUTES
    # care_instructions = models.TextField(blank=True, null=True)
    # flowering_season = models.CharField(max_length=100, blank=True, null=True)
    # sunlight_requirement = models.CharField(max_length=100, blank=True, null=True)

    # is_single_unit = models.BooleanField(default=False)

    # def save(self, *args, **kwargs):
    #     if self.is_single_unit:
    #         if ProductVariant.objects.filter(product=self.product).count() >= 1:
    #             return

    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    @property
    def full_name(self):
        """Lotus Bulb - Pink (1 piece)"""
        return f"{self.product.name} - {self.name} ({self.unit_value} {self.unit})"

    @property
    def get_description(self):
        """
        Return variant description if exists, otherwise fallback to product description
        """
        return self.description or self.product.description

    @property
    def get_full_description(self):
        """
        Combine product base description with variant-specific details
        """
        base = self.product.description or ""
        variant_specific = self.description or ""

        if base and variant_specific:
            return f"{base}\n\n{variant_specific}"
        return variant_specific or base

    @property
    def discount_percentage(self):
        if self.mrp > self.price:
            return int(((self.mrp - self.price) / self.mrp) * 100)
        return 0

    class Meta(BaseModel.Meta):
        unique_together = ["product", "sku"]
        indexes = [
            models.Index(fields=["product", "sku"], name="idx_product_variant_sku"),
            models.Index(fields=["is_active"], name="idx_product_variant_is_active"),
            models.Index(
                fields=["product"],
                name="idx_product_image_order",
            ),
            models.Index(fields=["product"], name="idx_product_variant_product"),
        ]
        ordering = ["product"]
