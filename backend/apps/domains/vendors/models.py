from django.db import models
from django.utils import timezone

from shared.models import BaseModel


# Create your models here.
class Vendor(BaseModel):
    user = models.OneToOneField("users.User", on_delete=models.CASCADE, related_name="vendor")
    business_name = models.CharField(max_length=255)
    # email and phone will come from user
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)

    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)

    is_platform_vendor = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["is_approved"])]

    def __str__(self):
        return self.business_name

    def save(self, *args, **kwargs):
        # Auto-approve if platform vendor
        if self.is_platform_vendor and not self.is_approved:
            self.is_approved = True
            self.approved_at = timezone.now()

        super().save(*args, **kwargs)
