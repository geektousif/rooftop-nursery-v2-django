from typing import Optional
from uuid import UUID

from django.db import transaction
from django.utils.text import slugify

from apps.domains.categories.models import Category
from apps.domains.inventory.models import Stock
from apps.domains.vendors.models import Vendor
from core.exceptions import ProductNotFoundError

from ..models.product import Product, ProductVariant


@transaction.atomic
def product_create(
    *,
    vendor: Vendor,
    name: str,
    description: Optional[str] = None,
    category_ids: list[UUID],
    attributes: Optional[dict] = None,
    tags: Optional[list[str]] = None,
    variants: list[dict],
    is_active: bool = True,
) -> Product:
    """
    Create a new product with variants.

    Args:
        vendor: Vendor instance that owns the product
        name: Product name
        description: Optional product description
        category_ids: List of category UUIDs
        attributes: Optional JSON attributes
        tags: Optional list of tags
        variants: List of variant dicts with keys: name, sku, price, mrp, etc.
        is_active: Whether product is active (default: True)

    Returns:
        Created Product instance with variants

    Raises:
        ValueError: If category_ids contains invalid UUIDs
    """
    # Generate slug from name if not provided
    slug = slugify(name)

    # Ensure slug is unique (append vendor ID if needed)
    base_slug = slug
    counter = 1
    while Product.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Validate categories exist
    categories = Category.objects.filter(id__in=category_ids)
    if categories.count() != len(category_ids):
        raise ValueError("Some category IDs do not exist")

    # Create product
    product = Product.objects.create(
        vendor=vendor,
        name=name,
        slug=slug,
        description=description or "",
        attributes=attributes or {},
        tags=tags or [],
        is_active=is_active,
    )

    # Set categories
    product.category.set(categories)

    # Create variants
    variants_to_create = []
    stocks_to_create = []
    for variant_data in variants:
        variant = ProductVariant(
            product=product,
            name=variant_data["name"],
            sku=variant_data["sku"],
            price=variant_data["price"],
            mrp=variant_data["mrp"],
            cost_price=variant_data.get("cost_price"),
            weight_grams=variant_data.get("weight_grams"),
            unit=variant_data.get("unit", ""),
            unit_value=variant_data.get("unit_value"),
            variant_attributes=variant_data.get("variant_attributes", {}),
            display_order=variant_data.get("display_order", 0),
            is_active=variant_data.get("is_active", True),
        )
        variants_to_create.append(variant)
        stock = Stock(product_variant=variant, stock=variant_data["stock"])
        stocks_to_create.append(stock)

    # Bulk create variants
    ProductVariant.objects.bulk_create(variants_to_create)
    Stock.objects.bulk_create(stocks_to_create)

    # Refresh to get related data
    product.refresh_from_db()

    return product


@transaction.atomic
def product_update(
    *,
    product_id: UUID,
    name: Optional[str] = None,
    description: Optional[str] = None,
    category_ids: Optional[list[UUID]] = None,
    attributes: Optional[dict] = None,
    tags: Optional[list[str]] = None,
    is_active: Optional[bool] = None,
) -> Product:
    """
    Update an existing product.

    Args:
        product_id: Product UUID
        name: Optional new name
        description: Optional new description
        category_ids: Optional list of category UUIDs to replace
        attributes: Optional attributes dict to update
        tags: Optional tags list to replace
        is_active: Optional active status

    Returns:
        Updated Product instance

    Raises:
        ProductNotFoundError: If product doesn't exist
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ProductNotFoundError(f"Product with id {product_id} not found")

    # Update fields
    if name is not None:
        product.name = name
        # Update slug if name changed
        new_slug = slugify(name)
        if new_slug != product.slug:
            base_slug = new_slug
            counter = 1
            while Product.objects.filter(slug=new_slug).exclude(id=product.id).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1
            product.slug = new_slug

    if description is not None:
        product.description = description

    if attributes is not None:
        product.attributes = attributes

    if tags is not None:
        product.tags = tags

    if is_active is not None:
        product.is_active = is_active

    product.save()

    # Update categories if provided
    if category_ids is not None:
        categories = Category.objects.filter(id__in=category_ids)
        if categories.count() != len(category_ids):
            raise ValueError("Some category IDs do not exist")
        product.category.set(categories)

    product.refresh_from_db()
    return product


@transaction.atomic
def product_delete(*, product_id: UUID) -> None:
    """
    Soft delete a product (sets is_active=False).

    Args:
        product_id: Product UUID

    Raises:
        ProductNotFoundError: If product doesn't exist
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ProductNotFoundError()

    # Soft delete: deactivate product and variants
    product.is_active = False
    product.save()

    # Deactivate all variants
    ProductVariant.objects.filter(product=product).update(is_active=False)
