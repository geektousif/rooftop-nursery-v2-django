from dataclasses import dataclass
from typing import Optional
from uuid import UUID

PRODUCT_SORT_MAP = {
    "newest": "-created_at",
    "oldest": "created_at",
    "price_low": "price",
    "price_high": "-price",
    "name_asc": "product__name",
    "name_desc": "-product__name",
    "popular": "-review_count",  # Requires annotation
    "rating": "-avg_rating",  # Requires annotation
}


@dataclass(frozen=True)
class ProductFilters:
    # Search
    search: Optional[str] = None

    # Category
    category_slug: Optional[str] = None
    category_ids: Optional[list[UUID]] = None

    # Price Range
    min_price: Optional[float] = None
    max_price: Optional[float] = None

    # Vendor
    vendor_id: Optional[str] = None

    # Stock
    in_stock_only: Optional[bool] = False

    # Tags
    tags: Optional[list[str]] = None

    # Status
    include_inactive: bool = False

    # Sorting
    sort_by: str = "newest"  # newest, price_low, price_high, popular, rating
    # page: int = 1
    # per_page: int = 10


def build_product_filters(request, include_inactive: bool = False) -> ProductFilters:
    qp = request.query_params

    return ProductFilters(
        search=qp.get("search") or None,
        category_slug=qp.get("category") or None,
        vendor_id=qp.get("vendor") or None,
        min_price=int(qp["min_price"]) if qp.get("min_price") else None,
        max_price=int(qp["max_price"]) if qp.get("max_price") else None,
        in_stock_only=qp.get("in_stock") == "true",
        tags=qp.get("tags").split(",") if qp.get("tags") else None,
        sort_by=qp.get("sort", "newest"),
        include_inactive=include_inactive,
    )
