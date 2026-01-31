class RequestLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # print("User:", request.user.role)
        print("Response:", request.body)
        return response

    def process_exception(self, request, exception):
        print("Exception:", exception)
        return
