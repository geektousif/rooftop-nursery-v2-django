from rest_framework import status
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from silk.profiling.profiler import silk_profile

from apps.domains.products.api.common.serializers import (
    VariantDetailSerializer,
    VariantListSerializer,
)
from apps.domains.products.filters import build_product_filters
from apps.domains.products.models.product import ProductVariant
from apps.domains.products.selectors import (
    get_related_variants,
    get_sibling_variants,
    get_variant_detail,
    get_variants_for_storefront,
    search_variants,
)


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
