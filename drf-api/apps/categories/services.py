import logging
from functools import wraps

import jwt
from auth_kit.app_settings import MySetting
from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator

from apps.users.models import User

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

logger = logging.getLogger(__name__)


# decorator
def treenode_auth_required(
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

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if read_only_public and request.method in SAFE_METHODS:
                logger.info("ALLOWING PUBLIC ACCESS")
                return view_func(request, *args, **kwargs)

            token = None

            cookie_name = getattr(settings.AUTH_KIT, "AUTH_JWT_COOKIE_NAME", None) or getattr(
                MySetting, "AUTH_JWT_COOKIE_NAME", "auth-jwt"
            )

            # if cookie_name and request.COOKIES.get(cookie_name):
            if cookie_name and request.COOKIES.get(cookie_name):
                token = request.COOKIES.get(cookie_name)
            else:
                auth = request.META.get("HTTP_AUTHORIZATION", "")
                if auth.startswith("Bearer "):
                    token = auth.split(" ", 1)[1]

            logger.info("JWT token present=%s", bool(token))

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
            except jwt.PyJWTError as e:
                logger.warning("JWT decode failed: %s", e)
                return JsonResponse({"detail": "Invalid token"}, status=401)

            request.jwt_payload = payload

            if request.method not in SAFE_METHODS:
                user = User.objects.filter(id=payload["user_id"]).first()
                logger.info("User: %s", user.is_admin_user())
                if admin_only_write and not user.is_admin_user():
                    return JsonResponse(
                        {"detail": "Admin privileges required"},
                        status=403,
                    )

                if admin_only_write:
                    if not user.is_admin_user():
                        return JsonResponse(
                            {"detail": "Insufficient role"},
                            status=403,
                        )

            return view_func(request, *args, **kwargs)

        return _wrapped

    return decorator


def inject_dispatch_auth(view_class_or_func, auth_decorator):
    if hasattr(view_class_or_func, "view_class"):
        view_class = view_class_or_func.view_class
        view_initkwargs = view_class_or_func.view_initkwargs
    else:
        view_class = view_class_or_func
        view_initkwargs = {}

    # DON'T check if already decorated - just create a new decorated version
    # This creates a copy of the class with decorated dispatch
    decorated_class = type(
        view_class.__name__,
        (view_class,),
        {"dispatch": method_decorator(auth_decorator)(view_class.dispatch)},
    )

    logger.info(f"Created decorated {decorated_class.__name__}")
    return decorated_class.as_view(**view_initkwargs)
