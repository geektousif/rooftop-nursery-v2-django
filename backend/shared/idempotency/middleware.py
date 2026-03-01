from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

from shared.idempotency.services import check_and_store


class IdempotencyMiddleware(MiddlewareMixin):
    """
    Enforces idempotency for POST/PUT/PATCH when header is present.
    """

    HEADER = "HTTP_IDEMPOTENCY_KEY"

    def process_response(self, request, response):
        key = request.META.get(self.HEADER)
        if not key:
            return response

        if request.method not in {"POST", "PUT", "PATCH"}:
            return response

        try:
            check_and_store(key, response.content)
        except ValueError:
            return JsonResponse(
                {"detail": "Duplicate request"},
                status=409,
            )

        return response
