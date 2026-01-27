from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from silk.profiling.profiler import silk_profile

from apps.products.filters import build_product_filters
from apps.products.models import ProductVariant

# apps/products/views.py
from apps.products.selectors import (
    get_related_variants,
    get_sibling_variants,
    get_variant_detail,
    get_variants_for_storefront,
    search_variants,
)
from apps.products.serializers import (
    VariantDetailSerializer,
    VariantListSerializer,
)
from core.pagination import CursorPagination


class VariantListAPIView(APIView):
    """
    GET /api/v1/products/

    Returns: Paginated list of variants (not products)
    """

    permission_classes = []

    def get(self, request):
        # Extract filters
        filters = build_product_filters(request)

        # Get variants
        variants = get_variants_for_storefront(filters=filters)

        # Paginate
        paginator = CursorPagination()
        paginated_variants = paginator.paginate_queryset(variants, request)

        # Serialize
        serializer = VariantListSerializer(paginated_variants, many=True)

        return paginator.get_paginated_response(serializer.data)


class VariantDetailAPIView(APIView):
    """
    GET /api/v1/products/{slug}/
    GET /api/v1/products/{slug}/?sku=LB-PINK-1PC

    Returns: Single variant details + sibling variants
    """

    permission_classes = []

    @silk_profile(name="variant-detail")
    def get(self, request, slug):
        sku = request.query_params.get("sku")

        try:
            # Get main variant
            variant = get_variant_detail(slug=slug, sku=sku)

            # Get sibling variants (other options)
            siblings = get_sibling_variants(variant=variant)

            # Get related variants (recommendations)
            related = get_related_variants(variant=variant, limit=8)

            # Serialize
            serializer = VariantDetailSerializer(variant, context={"sibling_variants": siblings})

            return Response(
                {
                    "variant": serializer.data,
                    "related_variants": VariantListSerializer(related, many=True).data,
                }
            )

        except ProductVariant.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


class ProductSearchAPIView(APIView):
    """
    GET /api/v1/products/search/?q=lotus

    Returns: List of matching variants
    """

    permission_classes = []

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response(
                {"error": "Query too short (min 2 characters)"}, status=status.HTTP_400_BAD_REQUEST
            )

        variants = search_variants(query=query, limit=20)
        serializer = VariantListSerializer(variants, many=True)

        return Response({"query": query, "count": len(variants), "results": serializer.data})


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
