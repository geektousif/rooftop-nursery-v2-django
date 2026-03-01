class DomainError(Exception):
    code = "DOMAIN_ERROR"
    message = "A domain error occurred"

    def __init__(self, message=None):
        super().__init__(message or self.message)


class NotFoundError(DomainError):
    code = "NOT_FOUND"


class ValidationError(DomainError):
    code = "VALIDATION_ERROR"


class ConflictError(DomainError):
    code = "CONFLICT"
