from shared.permissions.exceptions import PermissionDenied


class BasePolicy:
    """
    Base class for domain policies.
    Policies must:
    - be stateless
    - never hit the DB
    - never return booleans (raise or pass)
    """

    @staticmethod
    def deny(message: str = "Permission denied"):
        raise PermissionDenied(message)
