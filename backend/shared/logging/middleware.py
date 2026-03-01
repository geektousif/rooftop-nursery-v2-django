import uuid

from shared.logging.filters import set_request_id


class RequestIDMiddleware:
    HEADER = "HTTP_X_REQUEST_ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get(self.HEADER, str(uuid.uuid4()))
        set_request_id(request_id)

        response = self.get_response(request)
        response["X-Request-ID"] = request_id
        return response
