from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.products.filters import build_product_filters
from apps.products.models.product import ProductVariant
from apps.products.selectors import ProductSelectors
from core.paginations import CursorPagination

from ..serializers.output import (
    ProductVariantDetailSerializer,
    ProductVariantListSerializer,
)


class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public product viewset for storefront.

    Endpoints:
    - GET /api/v1/products/ - List products
    - GET /api/v1/products/{slug}/ - Product detail
    - GET /api/v1/products/{slug}/?sku=SKU - Product detail by SKU
    """

    serializer_class = ProductVariantListSerializer
    permission_classes = []
    pagination_class = CursorPagination

    def get_queryset(self):
        """Get filtered variants for storefront."""
        filters = build_product_filters(self.request)
        return ProductSelectors.get_variants_for_storefront(filters=filters)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get("slug")
        sku = request.query_params.get("sku")

        try:
            variant = ProductSelectors.get_variant_detail(slug=slug, sku=sku)
            serializer = ProductVariantDetailSerializer(variant)
            return Response(serializer.data)
        except ProductVariant.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    def search(self, request, *args, **kwargs):
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response(
                {"error": "Query too short (min 2 characters)"}, status=status.HTTP_400_BAD_REQUEST
            )

        variants = ProductSelectors.search_variants(query=query, limit=20)
        serializer = ProductVariantListSerializer(variants, many=True)

        return Response({"query": query, "count": len(variants), "results": serializer.data})


# class VariantListAPIView(APIView):
#     """
#     GET /api/v1/products/

#     Returns: Paginated list of variants (not products)
#     """

#     permission_classes = []

#     def get(self, request):
#         # Extract filters

#         filters = build_product_filters(request)

#         # Get variants
#         variants = get_variants_for_storefront(filters=filters)
#         print(variants)
#         # Paginate
#         paginator = CursorPagination()
#         paginated_variants = paginator.paginate_queryset(variants, request)

#         # Serialize
#         serializer = ProductVariantListSerializerStorefront(paginated_variants, many=True)

#         return paginator.get_paginated_response(serializer.data)


# class VariantDetailAPIView(APIView):
#     """
#     GET /api/v1/products/{slug}/
#     GET /api/v1/products/{slug}/?sku=LB-PINK-1PC

#     Returns: Single variant details + sibling variants
#     """

#     permission_classes = []

#     @silk_profile(name="variant-detail")
#     def get(self, request, slug):
#         sku = request.query_params.get("sku")

#         try:
#             # Get main variant
#             variant = get_variant_detail(slug=slug, sku=sku)

#             # Get sibling variants (other options)
#             siblings = get_sibling_variants(variant=variant)

#             # Get related variants (recommendations)
#             related = get_related_variants(variant=variant, limit=8)

#             # Serialize
#             serializer = VariantDetailSerializer(variant, context={"sibling_variants": siblings})

#             return Response(
#                 {
#                     "variant": serializer.data,
#                     "related_variants": ProductVariantListSerializerStorefront(
#                         related, many=True
#                     ).data,
#                 }
#             )

#         except ProductVariant.DoesNotExist:
#             return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# class ProductSearchAPIView(APIView):
#     """
#     GET /api/v1/products/search/?q=lotus

#     Returns: List of matching variants
#     """

#     permission_classes = []

#     def get(self, request):
#         query = request.query_params.get("q", "").strip()

#         if len(query) < 2:
#             return Response(
#                 {"error": "Query too short (min 2 characters)"}, status=status.HTTP_400_BAD_REQUEST
#             )

#         variants = search_variants(query=query, limit=20)
#         serializer = ProductVariantListSerializerStorefront(variants, many=True)

#         return Response({"query": query, "count": len(variants), "results": serializer.data})
