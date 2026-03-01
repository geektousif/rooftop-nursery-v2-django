class PermissionDenied(Exception):
    """
    Raised when domain policy denies permission.
    Domain Level. Not HTTP Level.
    """

    def __init__(self, message="Permission Denied"):
        super().__init__(message)
