from django.db import models

from apps.core.models import BaseModel


# Create your models here.
class Vendor(BaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    # email and phone will come from user
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
