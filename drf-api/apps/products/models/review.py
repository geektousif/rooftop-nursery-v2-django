from django.db import models

from core.models import BaseModel


class ProductReview(BaseModel):
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    # variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE)
    reviewer_name = models.CharField(max_length=255)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    body = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Review for {self.product.name} by {self.customer.full_name}"

    class Meta(BaseModel.Meta):
        unique_together = ["product", "customer"]
        indexes = [models.Index(fields=["product", "customer"], name="idx_product_customer")]
