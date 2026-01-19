from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import BaseModel


# Create your models here.
class Customer(BaseModel):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    is_guest = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        verbose_name = "Customer"
        verbose_name_plural = "Customers"


# class Guest(BaseModel):
#     email = models.EmailField()
#     is_active = models.BooleanField(default=True)

#     class Meta(BaseModel.Meta):
#         verbose_name = "Guest"
#         verbose_name_plural = "Guests"


class Address(BaseModel):
    class AddressType(models.TextChoices):
        SHIPPING = "shipping", _("Shipping")
        BILLING = "billing", _("Billing")

    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.CASCADE, null=True, blank=True
    )
    type = models.CharField(max_length=255, choices=AddressType.choices)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True, default="India")
    pin_code = models.CharField(max_length=6)
    is_default = models.BooleanField(default=False)
