from rest_framework import status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler

from shared.errors.domain import DomainError
from shared.logging.logger import logger
from shared.permissions.exceptions import PermissionDenied


def domain_exception_handler(exc, context):
    if isinstance(exc, DomainError):
        return Response(
            {
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Permission errors (domain-level)
    if isinstance(exc, PermissionDenied):
        return Response(
            {
                "success": False,
                "error": {
                    "code": "PERMISSION_DENIED",
                    "message": str(exc),
                },
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, Throttled):
        return Response(
            {
                "success": False,
                "error": {
                    "code": "RATE_LIMITED",
                    "message": "Too many requests",
                },
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    # Unexpected errors (log once)
    logger.exception("Unhandled exception", exc_info=exc)

    response = exception_handler(exc, context)
    if response is not None:
        return response

    # Truly unknown failure
    return Response(
        {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
