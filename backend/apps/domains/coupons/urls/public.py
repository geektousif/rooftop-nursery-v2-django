"""
Public URLs for Coupons app - endpoints that don't require authentication.
"""

from django.urls import path

from .. import views

app_name = "coupons_public"

urlpatterns = [
    # Public coupon endpoints
    path("validate/", views.CouponValidateAPIView.as_view(), name="coupon_validate"),
]
