from rest_framework.throttling import UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Allow 100 requests per minute."""

    rate = "100/min"


class SustainedRateThrottle(UserRateThrottle):
    """Allow 1000 requests per hour."""

    rate = "1000/hour"
