class RequiresRoleMixin:
    """
    Optional helper for policies.
    """

    @staticmethod
    def require(condition: bool, message: str):
        if not condition:
            raise PermissionError(message)
