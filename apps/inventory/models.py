from django.db import models

from core.models import BaseModel

from django.db.models import F


# Create your models here.
class Stock(BaseModel):
    variant = models.ForeignKey("ProductVariant", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=0)

    available_quantity = models.GeneratedField(
        expression=F("quantity") - F("reserved_quantity"),
        output_field=models.PositiveIntegerField(),
        db_persist=True,
    )

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.variant_name}"


class InventoryLog(BaseModel):
    class InventoryAction(models.TextChoices):
        SALE = "sale"
        RESTOCK = "restock"
        RETURN = "return"
        ADJUSTMENT = "adjustment"
        RESERVE = "reserve"

    variant = models.ForeignKey("ProductVariant", on_delete=models.CASCADE)
    change_quantity = models.IntegerField()  # +ve for sale, -ve for return
    action_type = models.CharField(
        max_length=255,
        choices=InventoryAction.choices,
        default=InventoryAction.SALE,
    )
    reference_id = models.UUIDField(null=True, blank=True)
    reference_type = models.CharField(
        max_length=255, null=True, blank=True
    )  # order, return
    previous_quantity = models.PositiveIntegerField()
    current_quantity = models.GeneratedField(
        expression=F("previous_quantity") + F("change_quantity"),
        output_field=models.PositiveIntegerField(),
        db_persist=True,
    )

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.name}"

    class Meta(BaseModel.Meta):
        ordering = ["-created_at"]
