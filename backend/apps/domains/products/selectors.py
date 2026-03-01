from decimal import Decimal
from typing import Optional

from django.db.models.aggregates import Avg, Count
from django.db.models.expressions import F
from django.db.models.query import Prefetch, QuerySet
from django.db.models.query_utils import Q

from .filters import PRODUCT_SORT_MAP, ProductFilters
from .models.image import ProductImage
from .models.product import Product, ProductVariant
from .models.review import ProductReview


def get_variants_for_storefront(*, filters: ProductFilters) -> QuerySet[ProductVariant]:
    """
    Get variants for product listing page.
    Returns: QuerySet of ProductVariant objects with all relations prefetched.
    """
    # Base Queryset with with main relations and all Optimizations
    qs = (
        ProductVariant.objects.filter(is_active=True, product__is_active=True)
        .select_related("product", "product__vendor", "stock")
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True).order_by(
                    "display_order"
                )[:1],
                to_attr="display_images",
            ),
            # Prefetch product categories
            "product__category",
        )
        .annotate(
            # Annotate review stats (from product level)
            avg_rating=Avg("product__productreview__rating"),
            review_count=Count("product__productreview", distinct=True),
            # Annotate stock availability
            available_stock=F("stock__available_quantity"),
        )
    )

    if filters.category_slug is not None:
        qs = qs.filter(product__category__slug=filters.category_slug)

    if filters.search:
        qs = qs.filter(
            Q(product__name__icontains=filters.search)
            | Q(name__icontains=filters.search)
            | Q(product__description__icontains=filters.search)
            | Q(sku__icontains=filters.search)
            | Q(product__tags__contains=[filters.search])
        )

    if filters.vendor_id:
        qs = qs.filter(product__vendor_id=filters.vendor_id)

    if filters.min_price:
        qs = qs.filter(price__gte=filters.min_price)

    if filters.max_price:
        qs = qs.filter(price__lte=filters.max_price)

    if filters.in_stock_only:
        qs = qs.filter(stock__available_quantity__gt=0)

    if filters.tags:
        # Filter by product tags
        for tag in filters.tags:
            qs = qs.filter(product__tags__contains=[tag])

    # Apply sorting
    sort_field = PRODUCT_SORT_MAP.get(filters.sort_by, "-created_at")
    qs = qs.order_by(sort_field)

    return qs


def get_variant_detail(*, slug: str, sku: Optional[str] = None) -> ProductVariant:
    """
    Get single variant for detail page with all relations.
    Args:
        slug: Product slug (from URL: /products/lotus-bulb/)
        sku: Optional variant SKU (if multiple variants, show specific one)

    Returns: ProductVariant with all relations

    Example URLs:
    - /products/lotus-bulb/ → First variant of lotus-bulb
    - /products/lotus-bulb/?sku=LB-PINK-1PC → Specific variant
    """
    qs = (
        ProductVariant.objects.filter(product__slug=slug, is_active=True, product__is_active=True)
        .select_related(
            "product",
            "product__vendor",
            "stock",
        )
        .prefetch_related(
            # All images for this variant
            Prefetch("images", queryset=ProductImage.objects.order_by("display_order")),
            # Product categories (for breadcrumbs)
            "product__category",
            # Reviews (product-level)
            Prefetch(
                "product__productreview_set",
                queryset=ProductReview.objects.filter(is_verified=True)
                .select_related("customer__user")
                .order_by("-created_at"),
            ),
        )
        .annotate(
            avg_rating=Avg("product__productreview__rating"),
            review_count=Count("product__productreview"),
        )
    )

    if sku:
        # Specific variant requested
        return qs.get(sku=sku)
    else:
        # Get first variant (by display_order)
        return qs.order_by("display_order").first()


def get_featured_products(*, limit: int = 10) -> QuerySet[Product]:
    """Get featured products for homepage."""
    return (
        Product.objects.filter(is_active=True, is_featured=True)
        .select_related("vendor")
        .prefetch_related("productvariants_set__stock", "productimage_set")
        .order_by("-created_at")[:limit]
    )


def get_sibling_variants(*, variant: ProductVariant) -> QuerySet[ProductVariant]:
    """
    Get other variants of the same product (for variant selector).

    Example: Lotus Bulb - Pink, White, Red variants
    """
    return (
        ProductVariant.objects.filter(product=variant.product, is_active=True)
        .exclude(id=variant.id)
        .select_related("stock")
        .prefetch_related(
            # Display image for each variant
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            )
        )
        .order_by("display_order")
    )


def get_related_variants(*, variant: ProductVariant, limit: int = 8) -> QuerySet[ProductVariant]:
    """
    Get related variants (recommendations).

    Logic:
    1. Same category
    2. Similar price range (±20%)
    3. Exclude current product's variants
    4. Different vendors preferred
    """
    price_lower = variant.price * Decimal("0.8")
    price_upper = variant.price * Decimal("1.2")

    # Get variant's product categories
    category_ids = variant.product.category.values_list("id", flat=True)

    return (
        ProductVariant.objects.filter(
            is_active=True,
            product__is_active=True,
            product__category__in=category_ids,
            price__gte=price_lower,
            price__lte=price_upper,
            stock__available_quantity__gt=0,
        )
        .exclude(product_id=variant.product_id)  # Exclude same product
        .select_related(
            "product",
            "product__vendor",
            "stock",
        )
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            )
        )
        .annotate(
            avg_rating=Avg("product__productreview__rating"),
        )
        .order_by("-avg_rating", "?")[:limit]  # Prefer higher-rated  # Random if same rating
    )


def get_featured_variants(*, limit: int = 10) -> QuerySet[ProductVariant]:
    """
    Get featured variants for homepage.

    Logic: Manually featured products' first variant
    """
    # Assuming you add is_featured to Product model
    return (
        ProductVariant.objects.filter(
            is_active=True,
            product__is_active=True,
            product__is_featured=True,  # Add this field to Product
        )
        .select_related(
            "product",
            "product__vendor",
            "stock",
        )
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            )
        )
        .annotate(
            avg_rating=Avg("product__productreview__rating"),
        )
        .order_by("-created_at")[:limit]
    )


def get_best_seller_variants(*, limit: int = 10) -> QuerySet[ProductVariant]:
    """
    Get best-selling variants based on order quantity.
    """
    from apps.orders.models import OrderItem
    from django.db.models import Case, Sum, When

    # Get top-selling variant IDs
    top_variant_ids = (
        OrderItem.objects.values("variant_id")
        .annotate(total_sold=Sum("quantity"))
        .order_by("-total_sold")[:limit]
        .values_list("variant_id", flat=True)
    )

    # Preserve ordering
    preserved_order = Case(*[When(id=pk, then=pos) for pos, pk in enumerate(top_variant_ids)])

    return (
        ProductVariant.objects.filter(id__in=top_variant_ids, is_active=True)
        .select_related(
            "product",
            "product__vendor",
            "stock",
        )
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            )
        )
        .annotate(
            avg_rating=Avg("product__productreview__rating"),
        )
        .order_by(preserved_order)
    )


def search_variants(*, query: str, limit: int = 20) -> QuerySet[ProductVariant]:
    """
    Full-text search for variants.

    Searches: Product name, variant name, description, SKU, tags
    """
    return (
        ProductVariant.objects.filter(
            Q(product__name__icontains=query)
            | Q(name__icontains=query)
            | Q(product__description__icontains=query)
            | Q(sku__icontains=query)
            | Q(product__tags__contains=[query])
        )
        .filter(is_active=True, product__is_active=True)
        .select_related(
            "product",
            "product__vendor",
            "stock",
        )
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.filter(is_display_image=True)[:1],
                to_attr="display_images",
            )
        )
        .annotate(
            avg_rating=Avg("product__productreview__rating"),
        )
        .order_by("-avg_rating", "-created_at")[:limit]
    )


def get_autocomplete_suggestions(*, query: str, limit: int = 10) -> list[str]:
    """
    Get search autocomplete suggestions.

    Returns: List of product names matching query
    """
    if len(query) < 2:
        return []

    # Search product names (not variant names)
    products = (
        Product.objects.filter(name__icontains=query, is_active=True)
        .values_list("name", flat=True)
        .distinct()[:limit]
    )

    return list(products)
