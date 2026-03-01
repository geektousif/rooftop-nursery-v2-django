from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Coupon
from .serializers import CouponListSerializer, CouponSerializer


class CouponViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing coupons.
    """

    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "discount_type"]
    search_fields = ["code", "description"]
    ordering_fields = ["created_at", "start_date"]
    ordering = ["-created_at"]
    lookup_field = "code"

    def get_serializer_class(self):
        if self.action == "list":
            return CouponListSerializer
        return CouponSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related("applies_to_specific_products")
        return queryset

    @action(detail=True, methods=["get"], url_path="validate")
    def validate_coupon(self, request, code=None):
        """Validate a coupon code."""
        coupon = self.get_object()
        order_amount = float(request.query_params.get("order_amount", 0))

        # Check if coupon is valid
        now = timezone.now()
        if not coupon.is_active:
            return Response({"valid": False, "error": "Coupon is not active"})

        if not (coupon.start_date <= now <= coupon.end_date):
            return Response({"valid": False, "error": "Coupon is expired or not yet active"})

        if order_amount < coupon.min_order_amount:
            return Response(
                {
                    "valid": False,
                    "error": f"Minimum order amount of {coupon.min_order_amount} required",
                }
            )

        # Calculate discount
        if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
            discount = (order_amount * coupon.discount_value) / 100
            if coupon.max_discount_amount:
                discount = min(discount, coupon.max_discount_amount)
        else:
            discount = coupon.discount_value

        return Response(
            {
                "valid": True,
                "discount": discount,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value,
            }
        )
