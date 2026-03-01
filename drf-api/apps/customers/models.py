from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from core.models import BaseModel


# Create your models here.
class Customer(BaseModel):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="customer_profile",
    )

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
        HOME = "HOME", _("Home")
        OFFICE = "OFFICE", _("Office")
        OTHER = "OTHER", _("Other")

    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.CASCADE,
        related_name="addresses",
        null=True,
        blank=True,
    )
    label = models.CharField(max_length=255, choices=AddressType.choices, default=AddressType.HOME)
    full_name = models.CharField(max_length=255)
    phone = PhoneNumberField(region="IN")  # type: ignore
    email = models.EmailField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    pin_code = models.CharField(max_length=6)
    country = models.CharField(max_length=255, null=True, blank=True, default="India")
    is_default = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_default:
            # Unset default for other addresses of the same customer
            Address.objects.filter(customer=self.customer, is_default=True).exclude(
                pk=self.pk
            ).update(is_default=False)
        super().save(*args, **kwargs)
