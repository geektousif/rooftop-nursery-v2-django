import threading

_local = threading.local()


def set_request_id(request_id: str | None):
    _local.request_id = request_id


def get_request_id():
    return getattr(_local, "request_id", None)


class RequestIDFilter:
    def filter(self, record):
        record.request_id = get_request_id()
        return True
