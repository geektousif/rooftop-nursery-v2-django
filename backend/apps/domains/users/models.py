from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from shared.models import BaseModel

from .managers import UserManager

# Create your models here.

# TODO: explore AnonymousUser for guests.


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    class UserRoles(models.TextChoices):
        SUPER_ADMIN = "super_admin"
        STORE_ADMIN = "store_admin"
        CUSTOMER = "customer"
        VENDOR = "vendor"

    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=20, unique=True, validators=[RegexValidator(r"^\+?1?\d{9,15}$")]
    )
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=UserRoles,
        default=UserRoles.CUSTOMER,
    )

    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone", "full_name"]

    objects = UserManager()

    def __str__(self):
        return self.email or self.phone

    @property
    def is_store_admin(self):
        return self.role == self.UserRoles.STORE_ADMIN and self.is_staff

    @property
    def is_vendor(self):
        return self.role == self.UserRoles.VENDOR

    @property
    def is_customer(self):
        return self.role == self.UserRoles.CUSTOMER

    def can_access_admin_panel(self):
        return self.is_store_admin or self.is_superuser or self.is_staff

    def can_access_vendor_panel(self):
        return (self.is_vendor or self.is_store_admin) and hasattr(self, "vendor")
