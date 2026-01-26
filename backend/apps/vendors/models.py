from django.db import models

from apps.core.models import BaseModel


# Create your models here.
class Vendor(BaseModel):
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending"
        APPROVED = "approved"
        REJECTED = "rejected"
        SUSPENDED = "suspended"

    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    # email and phone will come from user
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    approval_status = models.CharField(
        max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING
    )
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_active(self):
        return self.approval_status == self.ApprovalStatus.APPROVED
