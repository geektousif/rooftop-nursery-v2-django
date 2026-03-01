"""
Base settings for nursery-multivendor project.
"""

import os
from datetime import timedelta
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()

environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


# Security
SECRET_KEY = env.str("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)  # type: ignore
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])  # type: ignore

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "django_filters",
    "phonenumber_field",
    "allauth",
    "auth_kit",
    "drf_spectacular",
    "drf_spectacular_sidecar",
    "treenode",
    "silk",
    "drf_standardized_errors",
    "debug_toolbar",
]

LOCAL_APPS = [
    "apps.users",
    "apps.vendors",
    "apps.categories",
    "apps.customers",
    "apps.products",
    "apps.inventory",
    "apps.images",
    # "apps.orders",
    # "apps.cart",
    # "apps.reviews",
    # "apps.cms",
    # "apps.payments",
    # "apps.notifications",
    # "apps.analytics",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "silk.middleware.SilkyMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CORS - must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

INTERNAL_IPS = [
    # ...
    "127.0.0.1",
    # ...
]

ROOT_URLCONF = "config.urls"

if not DEBUG:
    CORS_ALLOWED_ORIGINS = env.list(
        "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000", "http://127.0.0.1:3000"]
    )

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASES = {"default": env.db("DATABASE_URL")}


AUTHENTICATION_BACKENDS = [
    "apps.users.backends.PhoneOrEmailAuthenticationBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    # {
    #     "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    # },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 6,
        },
    },
    # {
    #     "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    # },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"  # Indian timezone
USE_I18N = True
USE_TZ = True

SILKY_PYTHON_PROFILER = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

# Media files
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"


# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "auth_kit.authentication.JWTCookieAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_standardized_errors.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "drf_standardized_errors.handler.exception_handler",
}

AUTH_KIT = {
    "AUTH_TYPE": "jwt",  # 'jwt', 'token', or 'custom'
    "USE_AUTH_COOKIE": True,  # Enable cookie-based authentication
    "SESSION_LOGIN": False,  # Enable Django session login
    "ALLOW_LOGIN_REDIRECT": False,  # Allow login redirects
    # 🔑 REQUIRED for browser
    "AUTH_COOKIE_SAMESITE": "None",
    "AUTH_COOKIE_SECURE": True,
    "AUTH_COOKIE_HTTPONLY": True,
    "USER_SERIALIZER": "apps.users.serializers.UserTokenPayloadSerializer",
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

TREENODE_API_USE_JWT = True


# Cloudinary (for production file storage)
IMAGEKIT_STORAGE = {
    "PUBLIC_KEY": env.str("IMAGEKIT_PUBLIC_KEY"),
    "PRIVATE_KEY": env.str("IMAGEKIT_PRIVATE_KEY"),
    "URL_ENDPOINT": env.str("IMAGEKIT_URL_ENDPOINT"),
}

# Logging

# LOG_DIR = os.path.join(BASE_DIR, "logs")
# if not os.path.exists(LOG_DIR):
#     os.makedirs(LOG_DIR)

# LOGGING = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "formatters": {
#         "verbose": {
#             "format": "{levelname} {asctime} {module} {message}",
#             "style": "{",
#         },
#         "simple": {
#             "format": "{levelname} {message}",
#             "style": "{",
#         },
#     },
#     "handlers": {
#         "console": {
#             "class": "logging.StreamHandler",
#             "formatter": "simple",
#             "level": "INFO",
#         },
#         "file": {
#             "class": "logging.handlers.TimedRotatingFileHandler",
#             "filename": os.path.join(LOG_DIR, "debug.log"),
#             "when": "midnight",
#             "backupCount": 7,
#             "formatter": "verbose",
#             "level": "DEBUG",
#         },
#     },
#     "root": {
#         "handlers": ["console", "file"],
#         "level": "INFO",
#     },
#     "loggers": {
#         "django": {
#             "handlers": ["console", "file"],
#             "level": "INFO",
#             "propagate": False,
#         },
#     },
# }

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "DEBUG",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}

# # Phone Number Field
PHONENUMBER_DEFAULT_REGION = "IN"  # India
PHONENUMBER_DEFAULT_FORMAT = "NATIONAL"


# API Documentation
SPECTACULAR_SETTINGS = {
    "TITLE": "Rooftop Nursery API",
    "DESCRIPTION": "API for multivendor nursery e-commerce platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": True,
    "COMPONENT_SPLIT_REQUEST": True,
    "SWAGGER_UI_DIST": "SIDECAR",  # shorthand to use the sidecar instead
    "SWAGGER_UI_FAVICON_HREF": "SIDECAR",
    "REDOC_DIST": "SIDECAR",
    "ENUM_NAME_OVERRIDES": {
        "ValidationErrorEnum": "drf_standardized_errors.openapi_serializers.ValidationErrorEnum.choices",
        "ClientErrorEnum": "drf_standardized_errors.openapi_serializers.ClientErrorEnum.choices",
        "ServerErrorEnum": "drf_standardized_errors.openapi_serializers.ServerErrorEnum.choices",
        "ErrorCode401Enum": "drf_standardized_errors.openapi_serializers.ErrorCode401Enum.choices",
        "ErrorCode403Enum": "drf_standardized_errors.openapi_serializers.ErrorCode403Enum.choices",
        "ErrorCode404Enum": "drf_standardized_errors.openapi_serializers.ErrorCode404Enum.choices",
        "ErrorCode405Enum": "drf_standardized_errors.openapi_serializers.ErrorCode405Enum.choices",
        "ErrorCode406Enum": "drf_standardized_errors.openapi_serializers.ErrorCode406Enum.choices",
        "ErrorCode415Enum": "drf_standardized_errors.openapi_serializers.ErrorCode415Enum.choices",
        "ErrorCode429Enum": "drf_standardized_errors.openapi_serializers.ErrorCode429Enum.choices",
        "ErrorCode500Enum": "drf_standardized_errors.openapi_serializers.ErrorCode500Enum.choices",
    },
    "POSTPROCESSING_HOOKS": ["drf_standardized_errors.openapi_hooks.postprocess_schema_enums"],
}

DRF_STANDARDIZED_ERRORS = {
    "EXCEPTION_HANDLER_CLASS": "drf_standardized_errors.handler.ExceptionHandler",
    "EXCEPTION_FORMATTER_CLASS": "drf_standardized_errors.formatter.ExceptionFormatter",
    "ALLOWED_ERROR_STATUS_CODES": [
        "400",
        "401",
        "403",
        "404",
        "405",
        "406",
        "415",
        "429",
        "500",
    ],
    "ENABLE_IN_DEBUG_FOR_UNHANDLED_EXCEPTIONS": True,
}


# Celery Configuration
# CELERY_BROKER_URL = config("REDIS_URL", default="redis://localhost:6379/0")
# CELERY_RESULT_BACKEND = config("REDIS_URL", default="redis://localhost:6379/0")
# CELERY_ACCEPT_CONTENT = ["json"]
# CELERY_TASK_SERIALIZER = "json"
# CELERY_RESULT_SERIALIZER = "json"
# CELERY_TIMEZONE = "Asia/Kolkata"

# # Cache
# CACHES = {
#     "default": {
#         "BACKEND": "django.core.cache.backends.redis.RedisCache",
#         "LOCATION": config("REDIS_URL", default="redis://localhost:6379/1"),
#     }
# }

# Email Configuration
# EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
# EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
# EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
# EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
# EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
# EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
# DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@nurseryhub.com")

# SMS Configuration (MSG91)
# MSG91_AUTH_KEY = config("MSG91_AUTH_KEY", default="")
# MSG91_SENDER_ID = config("MSG91_SENDER_ID", default="NRSHUB")

# Razorpay Configuration
# PHONEPE_KEY_ID = config("PHONEPE_KEY_ID", default="")
# # PHONEPE_KEY_SECRET = config("PHONEPE_KEY_SECRET", default="")

# Business Settings
# PLATFORM_COMMISSION_RATE = config("PLATFORM_COMMISSION_RATE", default=15.0, cast=float)
# FREE_SHIPPING_THRESHOLD = config("FREE_SHIPPING_THRESHOLD", default=500.0, cast=float)
# BASE_SHIPPING_CHARGE = config("BASE_SHIPPING_CHARGE", default=50.0, cast=float)
# COD_ENABLED = config("COD_ENABLED", default=True, cast=bool)
# COD_LIMIT = config("COD_LIMIT", default=5000.0, cast=float)
# GST_RATE = config("GST_RATE", default=18.0, cast=float)

# Sentry (Error tracking)
# SENTRY_DSN = config("SENTRY_DSN", default="")
# if SENTRY_DSN:
#     import sentry_sdk
#     from sentry_sdk.integrations.django import DjangoIntegration

#     sentry_sdk.init(
#         dsn=SENTRY_DSN,
#         integrations=[DjangoIntegration()],
#         traces_sample_rate=0.1,
#         send_default_pii=True,
#     )
