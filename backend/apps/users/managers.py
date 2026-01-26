from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def _create_user_object(
        self, phone=None, email=None, role=None, password=None, **extra_fields
    ):
        # if not password:
        #     raise ValueError("Password must be provided")

        if not (email or phone):
            raise ValueError("Either phone or email must be provided")

        role = role or self.model.UserRoles.CUSTOMER

        if email:
            email = self.normalize_email(email)

        user = self.model(phone=phone, email=email, role=role, **extra_fields)
        user.set_password(password)
        return user

    def _create_user(
        self, phone=None, email=None, role=None, password=None, **extra_fields
    ):
        user = self._create_user_object(phone, email, role, password, **extra_fields)
        user.save(using=self._db)
        return user

    def create_user(
        self, phone=None, email=None, role=None, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, email, role, password, **extra_fields)

    create_user.alters_data = True

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", self.model.UserRoles.SUPER_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email=email, password=password, **extra_fields)

    create_superuser.alters_data = True

    def create_admin(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", self.model.UserRoles.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Admin must have is_staff=True.")
        if extra_fields.get("is_superuser") is not False:
            raise ValueError("Admin must have is_superuser=False.")

        return self._create_user(email=email, password=password, **extra_fields)

    create_admin.alters_data = True
