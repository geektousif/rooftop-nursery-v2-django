from django.db import models

from apps.core.models import BaseModel


# Create your models here.
class Coupon(BaseModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed"

    code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.FloatField()
    min_order_amount = models.FloatField()
    max_discount_amount = models.FloatField(null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    usage_limit = models.PositiveIntegerField()
    usage_limit_per_user = models.PositiveIntegerField()
    applies_to_all_products = models.BooleanField(default=False)
    applies_to_specific_products = models.ManyToManyField(
        "products.ProductVariant", blank=True, related_name="coupons", null=True
    )
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.code
