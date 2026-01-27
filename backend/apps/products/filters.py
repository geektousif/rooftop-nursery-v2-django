from dataclasses import dataclass
from typing import Literal, Optional

ProductSort = Literal[
    "price",
    "-price",
    "name",
    "-name",
    "-created_at",
    "popular",
    "rating",
]

PRODUCT_SORT_MAP: dict[ProductSort, str] = {
    "price": "price",
    "-price": "-price",
    "name": "product__name",
    "-name": "-product__name",
    "-created_at": "-created_at",
    "popular": "-review_count",
    "rating": "-avg_rating",
}


@dataclass(frozen=True)
class ProductFilters:
    category_slug: Optional[str] = None
    search: Optional[str] = None
    vendor_id: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    in_stock_only: Optional[bool] = False
    tags: Optional[list[str]] = None
    sort_by: ProductSort = "-created_at"
    # page: int = 1
    # per_page: int = 10


def build_product_filters(request) -> ProductFilters:
    qp = request.query_params

    return ProductFilters(
        category_slug=qp.get("category") or None,
        search=qp.get("search") or None,
        vendor_id=qp.get("vendor") or None,
        min_price=int(qp["min_price"]) if qp.get("min_price") else None,
        max_price=int(qp["max_price"]) if qp.get("max_price") else None,
        in_stock_only=qp.get("in_stock") == "true",
        sort_by=qp.get("sort", "-created_at"),
        tags=qp.get("tags").split(",") if qp.get("tags") else None,
    )
