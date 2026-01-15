from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin

from apps.users.managers import UserManager
from apps.core.models import BaseModel

# Create your models here.

# TODO: explore AnonymousUser for guests.




class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    class UserRoles(models.TextChoices):
        SUPER_ADMIN = "super_admin"
        ADMIN = "admin"
        CUSTOMER = "customer"
        VENDOR = "vendors"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=UserRoles,
        default=UserRoles.CUSTOMER,
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["email"]

    objects = UserManager()

    def __str__(self):
        return self.email or self.phone
