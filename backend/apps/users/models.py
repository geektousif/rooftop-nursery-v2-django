from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

from apps.core.models import BaseModel
from apps.users.managers import UserManager

# Create your models here.

# TODO: explore AnonymousUser for guests.


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    class UserRoles(models.TextChoices):
        SUPER_ADMIN = "super_admin"
        ADMIN = "admin"
        CUSTOMER = "customer"
        VENDOR = "vendors"

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

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone", "full_name"]

    objects = UserManager()

    def __str__(self):
        return self.email or self.phone

    @property
    def is_admin(self):
        return self.role == self.UserRoles.ADMIN and self.is_staff

    @property
    def is_vendor(self):
        return self.role == self.UserRoles.VENDOR

    @property
    def is_customer(self):
        return self.role == self.UserRoles.CUSTOMER
