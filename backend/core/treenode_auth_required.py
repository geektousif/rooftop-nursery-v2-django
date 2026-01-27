# apps/core/treenode_auth.py
from functools import wraps

import jwt
from django.conf import settings
from django.http import JsonResponse

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def treenode_auth_required(
    view_func,
    *,
    allow_roles=None,  # e.g. {"vendor", "admin"}
    admin_only_write=False,  # shorthand
    read_only_public=False,
):
    """
    Unified auth for treenode APIs:
    - Public read access
    - JWT (header or cookie) for writes
    - role-based write access
    """

    allow_roles = set(allow_roles or [])

    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if read_only_public and request.method in SAFE_METHODS:
            return view_func(request, *args, **kwargs)

        token = None

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        else:
            token = request.COOKIES.get("access")

        if not token:
            return JsonResponse(
                {"detail": "Authentication credentials were not provided"},
                status=401,
            )

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
            )
        except jwt.PyJWTError:
            return JsonResponse({"detail": "Invalid token"}, status=401)

        request.jwt_payload = payload

        if request.method not in SAFE_METHODS:
            if admin_only_write:
                if not payload.get("is_superuser"):
                    return JsonResponse(
                        {"detail": "Admin privileges required"},
                        status=403,
                    )

            if allow_roles:
                role = payload.get("role")
                if role not in allow_roles and not payload.get("is_superuser"):
                    return JsonResponse(
                        {"detail": "Insufficient role"},
                        status=403,
                    )

        return view_func(request, *args, **kwargs)

    return _wrapped
