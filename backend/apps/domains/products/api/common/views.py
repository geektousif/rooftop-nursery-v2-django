from django.db.models import Prefetch
from django.db.models.query import QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from silk.profiling.profiler import silk_profile

from apps.domains.inventory.models import Stock
from apps.domains.products.api.common import dumper
from apps.domains.products.models.image import ProductImage
from core.exceptions import ProductNotFoundError
from core.permissions import IsOwnerOrAdmin
from shared.logging import logger

from ...models.product import Product, ProductVariant
from .serializers import (
    ProductCreateSerializer,
    ProductSerializer,
    ProductUpdateSerializer,
    VariantCreateSerializer,
    VariantDetailSerializer,
    VariantUpdateSerializer,
)


class ProductViewSet(ModelViewSet):
    permission_classes = [IsOwnerOrAdmin]
    queryset = (
        Product.objects.select_related("vendor")
        .prefetch_related(
            "productvariant_set",
            "category",
            Prefetch(
                "productvariant_set__images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            ),
            Prefetch(
                "productvariant_set__stock",
                queryset=Stock.objects.filter(available_quantity__gt=0),
                to_attr="stock_available",
            ),
        )
        .order_by("-created_at")
    )

    owner = "vendor"

    def get_serializer_class(self):
        # Different serializers for different actions
        if self.action == "create":
            return ProductCreateSerializer
        elif self.action == "update":
            return ProductUpdateSerializer
        elif self.action == "retrieve":
            return VariantDetailSerializer

        return ProductSerializer

    def get_queryset(self) -> QuerySet:
        if self.request.user.can_access_admin_panel():
            return super().get_queryset()

        return super().get_queryset().filter(vendor=self.request.user.vendor)

    @silk_profile(name="product-list")
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return Response(dumper.dump(queryset), status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create product (admin and vendor)",
        request=ProductCreateSerializer,
        responses={
            201: VariantDetailSerializer,
            400: {"description": "Validation error"},
            403: {"description": "Not a vendor"},
        },
    )
    def create(self, request, *args, **kwargs) -> Response:
        """Create a new product with variants."""
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.product_crud import product_create

            product = product_create(
                vendor=vendor,
                name=serializer.validated_data["name"],
                description=serializer.validated_data.get("description"),
                category_ids=serializer.validated_data["category_ids"],
                attributes=serializer.validated_data.get("attributes"),
                tags=serializer.validated_data.get("tags"),
                variants=serializer.validated_data["variants"],
                is_active=serializer.validated_data.get("is_active", True),
            )

            # Use ProductDetailSerializer to show product + variants
            output_serializer = VariantDetailSerializer(product)

            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            logger.error(f"Product creation failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Product creation failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create product"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        serializer = ProductUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.product_crud import product_update

            product = product_update(
                product_id=kwargs["pk"],
                name=serializer.validated_data["name"],
                description=serializer.validated_data.get("description"),
                category_ids=serializer.validated_data["category_ids"],
                attributes=serializer.validated_data.get("attributes"),
                tags=serializer.validated_data.get("tags"),
                is_active=serializer.validated_data.get("is_active", True),
            )

            # Use ProductDetailSerializer to show product + variants
            output_serializer = ProductUpdateSerializer(product)

            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.error(f"Product update failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Product update failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update product"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.product_crud import product_delete

            product_delete(product_id=kwargs["pk"])

            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductNotFoundError:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Product deletion failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to delete product"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VariantViewSet(ModelViewSet):
    serializer_class = VariantCreateSerializer
    permission_classes = [IsOwnerOrAdmin]
    owner = ["product.vendor"]

    def get_queryset(self):
        return ProductVariant.objects.filter(product=self.kwargs["product_pk"])

    def get_serializer_class(self):
        # Different serializers for different actions
        if self.action == "update":
            return VariantUpdateSerializer
        return VariantCreateSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.variant_crud import variant_create

            variant = variant_create(
                product_id=kwargs["product_pk"],
                name=request.data["name"],
                sku=request.data["sku"],
                price=request.data["price"],
                mrp=request.data["mrp"],
                cost_price=request.data.get("cost_price"),
                weight_grams=request.data.get("weight_grams"),
                unit=request.data.get("unit"),
                unit_value=request.data.get("unit_value"),
                variant_attributes=request.data.get("variant_attributes"),
                display_order=request.data.get("display_order", 0),
                is_active=request.data.get("is_active", True),
            )

            # Use ProductDetailSerializer to show product + variants
            output_serializer = VariantDetailSerializer(variant)

            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            logger.error(f"Variant creation failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Variant creation failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create variant"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        serializer = VariantUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.variant_crud import variant_update

            variant = variant_update(
                variant_id=kwargs["pk"],
                name=serializer.validated_data["name"],
                sku=serializer.validated_data["sku"],
                price=serializer.validated_data["price"],
                mrp=serializer.validated_data["mrp"],
                cost_price=serializer.validated_data.get("cost_price"),
                weight_grams=serializer.validated_data.get("weight_grams"),
                unit=serializer.validated_data.get("unit"),
                unit_value=serializer.validated_data.get("unit_value"),
                variant_attributes=serializer.validated_data.get("variant_attributes"),
                display_order=serializer.validated_data.get("display_order", 0),
                is_active=serializer.validated_data.get("is_active", True),
            )

            # Use ProductDetailSerializer to show product + variants
            output_serializer = VariantDetailSerializer(variant)

            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.error(f"Variant update failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Variant update failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update variant"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        try:
            # Get vendor from authenticated user
            vendor = request.user.vendor if hasattr(request.user, "vendor") else None
            if not vendor:
                return Response({"error": "User is not a vendor"}, status=status.HTTP_403_FORBIDDEN)

            # Service handles business logic
            from ...services.variant_crud import variant_delete

            variant_delete(variant_id=kwargs["pk"])

            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductNotFoundError:
            return Response({"error": "Variant not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Variant deletion failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to delete variant"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# class ProductListAPIView(APIView):
#     """
#     Public endpoint for storefront product listing.
#     No authentication required.
#     """

#     # @extend_schema(
#     #     summary="List products for storefront",
#     #     description="Get paginated list of active products with filters",
#     #     parameters=[
#     #         OpenApiParameter(name='category', type=str, description='Category slug'),
#     #         OpenApiParameter(name='search', type=str, description='Search query'),
#     #         OpenApiParameter(name='sort_by', type=str, description='Sort field'),
#     #     ],
#     #     responses={200: ProductListSerializer(many=True)},
#     # )
#     def get(self, request):
#         # Extract query params
#         filters = {
#             "category_slug": request.query_params.get("category"),
#             "search": request.query_params.get("search"),
#             "min_price": request.query_params.get("min_price"),
#             "max_price": request.query_params.get("max_price"),
#             "sort_by": request.query_params.get("sort_by", "-created_at"),
#         }

#         # Call selector (read operation)
#         products = get_products_for_storefront(**filters)

#         # Paginate
#         paginator = CursorPagination()
#         paginated_products = paginator.paginate_queryset(products, request)

#         # Serialize
#         serializer = ProductListSerializer(paginated_products, many=True)

#         return paginator.get_paginated_response(serializer.data)


# class ProductViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing products.

#     list: Get all products (doesn't require authentication)
#     retrieve: Get a single product with full details
#     create: Create a new product
#     update: Update a product
#     partial_update: Partially update a product
#     destroy: Delete a product
#     search: Search products by name, description, tags
#     by_category: Get products by category slug
#     by_vendor: Get products by vendor
#     """

#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter,
#         filters.OrderingFilter,
#     ]
#     permission_classes = [IsOwnerOrReadOnly]
#     filterset_fields = ["is_active", "vendor", "category"]
#     search_fields = ["name", "description", "tags", "slug"]
#     ordering_fields = ["name", "created_at"]
#     ordering = ["-created_at"]
#     lookup_field = "slug"
#     owner_field = ["vendor.user"]

#     def get_serializer_class(self):
#         if self.action == "list":
#             return ProductListSerializer
#         return ProductSerializer

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         # Optimize queries with select_related and prefetch_related
#         queryset = queryset.select_related("vendor", "vendor__user").prefetch_related(
#             "category",
#             Prefetch(
#                 "productvariant_set",
#                 queryset=ProductVariant.objects.filter(is_active=True)
#                 .prefetch_related("productimage_set")
#                 .select_related("stock"),
#             ),
#             "productreview_set",
#         )
#         return queryset

#     @action(detail=False, methods=["get"])
#     def search(self, request):
#         """Advanced search for products."""
#         query = request.query_params.get("q", "")
#         category_slug = request.query_params.get("category", None)
#         min_price = request.query_params.get("min_price", None)
#         max_price = request.query_params.get("max_price", None)
#         vendor_id = request.query_params.get("vendor", None)

#         queryset = self.get_queryset().filter(is_active=True)

#         if query:
#             queryset = queryset.filter(
#                 Q(name__icontains=query)
#                 | Q(description__icontains=query)
#                 | Q(tags__icontains=query)
#             )

#         if category_slug:
#             queryset = queryset.filter(category__slug=category_slug)

#         if vendor_id:
#             queryset = queryset.filter(vendor_id=vendor_id)

#         if min_price or max_price:
#             variants = ProductVariant.objects.filter(is_active=True)
#             if min_price:
#                 variants = variants.filter(price__gte=min_price)
#             if max_price:
#                 variants = variants.filter(price__lte=max_price)
#             product_ids = variants.values_list("product_id", flat=True).distinct()
#             queryset = queryset.filter(id__in=product_ids)

#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"], url_path="by-category/(?P<category_slug>[^/.]+)")
#     def by_category(self, request, category_slug=None):
#         """Get products by category slug."""
#         queryset = self.get_queryset().filter(category__slug=category_slug, is_active=True)
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"], url_path="by-vendor/(?P<vendor_id>[^/.]+)")
#     def by_vendor(self, request, vendor_id=None):
#         """Get products by vendor ID."""
#         queryset = self.get_queryset().filter(vendor_id=vendor_id, is_active=True)
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)


# class ProductVariantViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing product variants.
#     """

#     queryset = ProductVariant.objects.all()
#     serializer_class = ProductVariantSerializer
#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter,
#         filters.OrderingFilter,
#     ]
#     permission_classes = [IsOwnerOrReadOnly]
#     filterset_fields = ["is_active", "product", "is_single_unit"]
#     search_fields = ["name", "sku", "product__name"]
#     ordering_fields = ["display_order", "price", "created_at"]
#     ordering = ["display_order"]
#     lookup_field = "sku"
#     owner_field = ["product.vendor.user"]

#     def get_serializer_class(self):
#         if self.action == "list":
#             return ProductVariantListSerializer
#         return ProductVariantSerializer

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         queryset = queryset.select_related("product").prefetch_related("productimage_set", "stock")
#         return queryset

#     @action(detail=True, methods=["get"])
#     def stock(self, request, sku=None):
#         """Get stock information for this variant."""
#         variant = self.get_object()
#         from apps.inventory.serializers import StockSerializer

#         stock = variant.stock
#         if stock:
#             serializer = StockSerializer(stock)
#             return Response(serializer.data)
#         return Response({"detail": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)


# class ProductReviewViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing product reviews.
#     """

#     queryset = ProductReview.objects.all()
#     serializer_class = ProductReviewSerializer
#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter,
#         filters.OrderingFilter,
#     ]
#     filterset_fields = ["product", "customer", "rating", "is_verified"]
#     search_fields = ["reviewer_name", "comment", "body"]
#     ordering_fields = ["created_at", "rating"]
#     ordering = ["-created_at"]
#     permission_classes = [IsOwnerOrReadOnly]
#     owner_field = ["customer.user", "product.vendor.user"]

#     def get_serializer_class(self):
#         if self.action == "list":
#             return ProductReviewListSerializer
#         return ProductReviewSerializer

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         queryset = queryset.select_related("product", "customer", "customer__user")
#         return queryset

#     @action(detail=False, methods=["get"], url_path="by-product/(?P<product_id>[^/.]+)")
#     def by_product(self, request, product_id=None):
#         """Get all reviews for a specific product."""
#         queryset = self.get_queryset().filter(product_id=product_id)
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

#     @action(
#         detail=False,
#         methods=["get"],
#         url_path="by-product/(?P<product_id>[^/.]+)/stats",
#     )
#     def product_review_stats(self, request, product_id=None):
#         """Get review statistics for a product."""
#         reviews = self.get_queryset().filter(product_id=product_id)
#         total_reviews = reviews.count()
#         if total_reviews == 0:
#             return Response(
#                 {"total_reviews": 0, "average_rating": None, "rating_distribution": {}}
#             )

#         average_rating = sum(r.rating for r in reviews) / total_reviews
#         rating_distribution = {}
#         for rating in range(1, 6):
#             rating_distribution[rating] = reviews.filter(rating=rating).count()

#         return Response(
#             {
#                 "total_reviews": total_reviews,
#                 "average_rating": round(average_rating, 2),
#                 "rating_distribution": rating_distribution,
#             }
#         )
