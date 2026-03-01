from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from core.models import BaseModel

from .managers import UserManager

# Create your models here.

# TODO: explore AnonymousUser for guests.


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    """
    Custom user model supporting multiple roles.
    """

    class UserRoles(models.TextChoices):
        CUSTOMER = "CUSTOMER", _("Customer")
        VENDOR = "VENDOR", _("Vendor")
        ADMIN = "ADMIN", _("Admin")

    email = models.EmailField(unique=True)
    phone = PhoneNumberField(unique=True, region="IN")  # type: ignore

    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=UserRoles,
        default=UserRoles.CUSTOMER,
    )

    # is_email_verified = models.BooleanField(default=False)
    # is_phone_verified = models.BooleanField(default=False)

    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone", "full_name"]

    objects = UserManager()

    def __str__(self):
        # autommatically generated method to return a role
        return f"{self.email} ({self.get_role_display()})"  # type: ignore

    def is_vendor(self):
        return self.role == self.UserRoles.VENDOR

    def is_customer(self):
        return self.role == self.UserRoles.CUSTOMER

    def is_admin_user(self):
        return (self.role == self.UserRoles.ADMIN and self.is_staff) or self.is_superuser
