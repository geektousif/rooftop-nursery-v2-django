import logging

from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.products.filters import build_product_filters
from apps.products.models.product import Product, ProductVariant
from apps.products.selectors import ProductSelectors
from apps.products.serializers.output import (
    ProductVariantListSerializer,
)
from apps.products.serializers.product import (
    CreatedProductResponseSerializer,
    ProductSerializer,
    ProductWriteSerializer,
)
from apps.products.services import ProductService
from core.paginations import CursorPagination
from core.permissions import AnyoneCanCreate, IsOwnerOrAdmin

logger = logging.getLogger(__name__)


class ProductViewSet(ModelViewSet):
    """
    Manage Products (catalog level).

    URL: /api/v1/admin/products/
    Resource: Product (not variant)
    """

    queryset = Product.objects.all()

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin, AnyoneCanCreate]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return (
            Product.objects.select_related("vendor", "vendor__user")
            .prefetch_related("categories", "variants")
            .annotate(
                variants_count=Count("variants"),
                active_variants_count=Count("variants", filter=Q(variants__is_active=True)),
            )
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductSerializer  # Product-level serializer

    @extend_schema(summary="List products (catalog)", responses={200: ProductSerializer(many=True)})
    def list(self, request):
        """List all products (not variants)."""
        return super().list(request)

    @extend_schema(
        summary="Update product",
        request=ProductWriteSerializer,
    )
    def partial_update(self, request, pk=None):
        """Update product-level fields."""
        product = self.get_object()  # Product instance

        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            ProductService.product_update(
                product=product, user=request.user, **serializer.validated_data
            )

            return Response({"message": "Product updated"})

        except Exception as e:
            logger.error(f"Update failed: {e}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductVariantViewSet(ModelViewSet):
    """
    Admin and vendor can create and update products.
    Includes View operations for Product and ProductVariant models.
    endpoints:
    - admin:
        - /admin/products/ [GET]
    - vendor (only products belonging to the vendor):
        - /vendor/products/ [GET]

    Includes Create operation for Product and ProductVariant and Inventory models.
    endpoints:
    - admin:
        - /admin/products/ [POST]

    Update product and product variants
    endpoints:
    - admin:
        - /admin/products/{pk}/ [PATCH]
    """

    pagination_class = CursorPagination

    owner_field = "product.vendor.user"

    queryset = ProductVariant.objects.select_related(
        "product",
        "product__vendor",
        "product__vendor__user",
    )

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin, AnyoneCanCreate]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer

        return ProductVariantListSerializer

    def get_queryset(self):
        """Get filtered variants for storefront."""

        if self.action == "list":
            filters = build_product_filters(self.request, include_inactive=True)
            qs = ProductSelectors.get_variants_for_storefront(filters=filters)
        else:
            qs = ProductVariant.objects.select_related("product", "stock")

        if self.request.user.is_admin_user():
            return qs

        return qs.filter(product__vendor__user=self.request.user)

    @extend_schema(
        summary="Create product (admin and vendor)",
        request=ProductWriteSerializer,
        responses={
            201: CreatedProductResponseSerializer,
            400: {"description": "Validation error"},
            403: {"description": "Not a vendor"},
        },
    )
    def create(self, request, *args, **kwargs):
        """Create a new product with variants."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vendor = self._resolve_vendor(request.user, serializer.validated_data)

            # Get vendor from authenticated user
            if not request.user.is_vendor() and not request.user.is_admin_user():
                raise ValueError("Not a vendor or admin")

            vendor = None
            if serializer.validated_data.get("vendor_id"):
                vendor = serializer.validated_data["vendor_id"]

                if vendor is None:
                    raise ValueError("No vendor found")

            elif request.user.vendor:
                vendor = request.user.vendor
            else:
                raise ValueError("No vendor found")

            # Service handles business logic

            result = ProductService.product_create(
                vendor=vendor,
                name=serializer.validated_data.get("name"),
                description=serializer.validated_data.get("description"),
                category_ids=serializer.validated_data["category_ids"],
                attributes=serializer.validated_data.get("attributes"),
                tags=serializer.validated_data.get("tags"),
                variants=serializer.validated_data["variants"],
                is_active=serializer.validated_data.get("is_active", True),
            )

            # Use ProductDetailSerializer to show product + variants

            output_serializer = CreatedProductResponseSerializer(result)

            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            logger.error(f"Product creation failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Product creation failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create product"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None, *args, **kwargs):
        variant = self.get_object()

        variant.vendor = variant.product.vendor

        serializer = self.get_serializer(variant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            ProductService.variant_update(
                variant=variant,
                user=request.user,
                **serializer.validated_data,
            )

            return Response({"message": "Product updated successfully"})

        except Exception as e:
            logger.error(f"Product update failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update product"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    # def get_serializer_class(self):
    #     if self.action in ["list"]:
    #         return ProductVariantListSerializerStorefront
    #     else:
    #         return ProductVariantSerializer

    # def get_queryset(self):
    #     return self.queryset.filter(vendor__user=self.request.user)

    # def list(self, request, *args, **kwargs):
    #     from ..selectors import get_variants_for_storefront

    #     try:
    #         filters = build_product_filters(request)
    #         variants = get_variants_for_storefront(filters=filters)
    #         # Paginate
    #         paginator = CursorPagination()
    #         paginated_variants = paginator.paginate_queryset(variants, request)

    #         # Serialize
    #         serializer = ProductVariantListSerializerStorefront(paginated_variants, many=True)

    #         return paginator.get_paginated_response(serializer.data)
    #     except Exception as e:
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
