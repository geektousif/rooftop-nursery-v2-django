from typing import Optional

from django.db.models.aggregates import Avg, Count, Min
from django.db.models.expressions import Case, When
from django.db.models.query import Prefetch, QuerySet

from apps.images.models import ProductImage
from apps.products.models import Product, ProductReview, ProductVariant


class ProductFilters:
    def __init__(
        self,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        vendor_id: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        sort_by: str = "-created_at",
        page: int = 1,
        per_page: int = 10,
    ) -> None:
        self.category_slug = category_slug
        self.search = search
        self.vendor_id = vendor_id
        self.min_price = min_price
        self.max_price = max_price
        self.sort_by = sort_by
        self.page = page
        self.per_page = per_page


def get_products_for_storefront(
    *,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    vendor_id: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by: str = "-created_at",
    page: int = 1,
    per_page: int = 10,
) -> QuerySet[Product]:
    """
    Get optimized product listing for storefront.

    Returns QuerySet with:
    - All active products
    - Prefetched variants, images, vendor
    - Filtered by category/search/price
    - Sorted by specified field

    Usage:
        products = get_products_for_storefront(
            category_slug='seeds',
            search='tomato',
            sort_by='price'
        )
    """
    # Base Queryset with all Optimizations
    qs = (
        Product.objects.filter(is_active=True)
        .select_related("vendor")
        .prefetch_related(
            Prefetch(
                "productvariant_set",
                queryset=ProductVariant.objects.filter(is_active=True)
                .prefetch_related(
                    Prefetch(
                        "productimage_set",
                        queryset=ProductImage.objects.filter(
                            is_display_image=True
                        ).order_by("display_order"),
                    )
                )
                .select_related("stock")
                .order_by("display_order"),
            ),
            "category",
        )
        .annotate(
            avg_rating=Avg("productreview__rating"),
            review_count=Count("productreview"),
            min_variant_price=Min("productvariant__price"),
        )
    )

    if category_slug:
        qs = qs.filter(category__slug=category_slug)

    if search:
        qs = qs.filter(name__icontains=search)

    if vendor_id:
        qs = qs.filter(vendor_id=vendor_id)

    if min_price:
        qs = qs.filter(productvariant__price__gte=min_price)

    if max_price:
        qs = qs.filter(productvariant__price__lte=max_price)

    # Apply sorting
    allowed_sorts = ["price", "-price", "name", "-created_at", "-avg_rating"]
    if sort_by in allowed_sorts:
        qs = qs.order_by(sort_by)
    else:
        qs = qs.order_by("-created_at")

    return qs


def get_product_detail(*, slug: str) -> Product:
    """
    Get single product with all relations for detail page.

    Raises:
        Product.DoesNotExist: If product not found or inactive
    """
    return (
        Product.objects.filter(slug=slug, is_active=True)
        .select_related("vendor")
        .prefetch_related(
            "productvariants_set__stock",
            "productimage_set",
            "category",
            Prefetch(
                "productreview_set",
                queryset=ProductReview.objects.filter(is_verified=True).order_by(
                    "-created_at"
                ),
            ),
        )
        .get()
    )


def get_featured_products(*, limit: int = 10) -> QuerySet[Product]:
    """Get featured products for homepage."""
    return (
        Product.objects.filter(is_active=True, is_featured=True)
        .select_related("vendor")
        .prefetch_related("productvariants_set__stock", "productimage_set")
        .order_by("-created_at")[:limit]
    )


def get_best_sellers(*, limit: int = 10) -> QuerySet[Product]:
    """
    Get best-selling products based on order count.
    Uses aggregation on OrderItem.
    """
    from django.db.models import Sum

    from apps.orders.models import OrderItem

    # Aggregate total quantity sold per product
    best_seller_ids = (
        OrderItem.objects.values("variant__product_id")
        .annotate(total_sold=Sum("quantity"))
        .order_by("-total_sold")[:limit]
        .values_list("variant__product_id", flat=True)
    )

    # Preserve ordering from aggregation
    preserved_order = Case(
        *[When(id=pk, then=pos) for pos, pk in enumerate(best_seller_ids)]
    )

    return (
        Product.objects.filter(id__in=best_seller_ids, is_active=True)
        .select_related("vendor")
        .prefetch_related("productvariants_set__stock", "productimage_set")
        .order_by(preserved_order)
    )
