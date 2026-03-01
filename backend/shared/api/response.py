from rest_framework.response import Response


def success(data=None, *, meta=None, status=200):
    return Response(
        {
            "success": True,
            "data": data,
            "meta": meta or {},
        },
        status=status,
    )


def error(*, code: str, message: str, status=400):
    return Response(
        {
            "success": False,
            "error": {
                "code": code,
                "message": message,
            },
        },
        status=status,
    )
