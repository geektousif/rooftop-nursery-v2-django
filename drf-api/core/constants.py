from enum import Enum


class UserRoles(Enum):
    CUSTOMER = "CUSTOMER"
    VENDOR = "VENDOR"
    ADMIN = "ADMIN"

    def __str__(self):
        return self.value
