from rest_framework.throttling import UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Allow 100 requests per minute."""

    rate = "100/min"


class SustainedRateThrottle(UserRateThrottle):
    """Allow 1000 requests per hour."""

    rate = "1000/hour"


# from rest_framework.throttling import SimpleRateThrottle


# class BaseUserThrottle(SimpleRateThrottle):
#     scope = "base"

#     def get_cache_key(self, request, view):
#         if not request.user or not request.user.is_authenticated:
#             ident = self.get_ident(request)
#         else:
#             ident = str(request.user.id)

#         return self.cache_format % {
#             "scope": self.scope,
#             "ident": ident,
#         }
# class CustomerThrottle(BaseUserThrottle):
#     scope = "customer"
# config/settings/base.py
# REST_FRAMEWORK = {
#     "DEFAULT_THROTTLE_CLASSES": [
#         "shared.api.throttles.PublicThrottle",
#     ],
#     "DEFAULT_THROTTLE_RATES": {
#         "public": "60/min",
#         "customer": "300/min",
#         "vendor": "600/min",
#         "owner": "2000/min",
#     },
# }
