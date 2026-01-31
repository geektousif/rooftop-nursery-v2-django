"""
Product services for write operations.

All services follow the style guide:
- Keyword-only arguments with `*,`
- Type hints for all parameters
- Use @transaction.atomic for multi-table writes
- Return model instances, not dicts
- Raise custom exceptions for errors
"""

from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.db import transaction
from django.utils.text import slugify

from apps.categories.models import Category
from apps.inventory.models import Stock
from apps.products.models import Product, ProductVariant
from apps.vendors.models import Vendor
from core.exceptions import ProductNotFoundError


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


@transaction.atomic
def variant_create(
    *,
    product_id: UUID,
    name: str,
    sku: str,
    price: Decimal,
    mrp: Decimal,
    cost_price: Optional[Decimal] = None,
    weight_grams: Optional[int] = None,
    unit: Optional[str] = None,
    unit_value: Optional[Decimal] = None,
    variant_attributes: Optional[dict] = None,
    display_order: int = 0,
    is_active: bool = True,
) -> ProductVariant:
    """
    Create a new variant for a product.

    Args:
        product_id: Product UUID
        name: Variant name
        sku: Unique SKU
        price: Selling price
        mrp: Maximum retail price
        cost_price: Optional cost price
        weight_grams: Optional weight in grams
        unit: Optional unit (e.g., "piece", "kg")
        unit_value: Optional unit value
        variant_attributes: Optional variant attributes dict
        display_order: Display order (default: 0)
        is_active: Whether variant is active (default: True)

    Returns:
        Created ProductVariant instance

    Raises:
        ProductNotFoundError: If product doesn't exist
        ValueError: If SKU already exists
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ProductNotFoundError()

    # Check SKU uniqueness
    if ProductVariant.objects.filter(sku=sku).exists():
        raise ValueError("Variant with this SKU already exists")

    variant = ProductVariant.objects.create(
        product=product,
        name=name,
        sku=sku,
        price=price,
        mrp=mrp,
        cost_price=cost_price,
        weight_grams=weight_grams,
        unit=unit or "",
        unit_value=unit_value,
        variant_attributes=variant_attributes or {},
        display_order=display_order,
        is_active=is_active,
    )

    return variant


@transaction.atomic
def variant_update(
    *,
    variant_id: UUID,
    name: Optional[str] = None,
    sku: Optional[str] = None,
    price: Optional[Decimal] = None,
    mrp: Optional[Decimal] = None,
    cost_price: Optional[Decimal] = None,
    weight_grams: Optional[int] = None,
    unit: Optional[str] = None,
    unit_value: Optional[Decimal] = None,
    variant_attributes: Optional[dict] = None,
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> ProductVariant:
    """
    Update an existing variant.

    Args:
        variant_id: Variant UUID
        name: Optional new name
        sku: Optional new SKU (must be unique)
        price: Optional new price
        mrp: Optional new MRP
        cost_price: Optional new cost price
        weight_grams: Optional new weight
        unit: Optional new unit
        unit_value: Optional new unit value
        variant_attributes: Optional new attributes
        display_order: Optional new display order
        is_active: Optional active status

    Returns:
        Updated ProductVariant instance

    Raises:
        ProductVariant.DoesNotExist: If variant doesn't exist
        ValueError: If new SKU already exists
    """
    try:
        variant = ProductVariant.objects.get(id=variant_id)
    except ProductVariant.DoesNotExist:
        raise ProductNotFoundError()

    # Update fields
    if name is not None:
        variant.name = name

    if sku is not None and sku != variant.sku:
        if ProductVariant.objects.filter(sku=sku).exclude(id=variant_id).exists():
            raise ValueError("Variant with this SKU already exists")
        variant.sku = sku

    if price is not None:
        variant.price = price

    if mrp is not None:
        variant.mrp = mrp

    if cost_price is not None:
        variant.cost_price = cost_price

    if weight_grams is not None:
        variant.weight_grams = weight_grams

    if unit is not None:
        variant.unit = unit

    if unit_value is not None:
        variant.unit_value = unit_value

    if variant_attributes is not None:
        variant.variant_attributes = variant_attributes

    if display_order is not None:
        variant.display_order = display_order

    if is_active is not None:
        variant.is_active = is_active

    variant.save()
    return variant


@transaction.atomic
def variant_delete(*, variant_id: UUID) -> None:
    """
    Soft delete a variant (sets is_active=False).

    Args:
        variant_id: Variant UUID

    Raises:
        ProductVariant.DoesNotExist: If variant doesn't exist
    """
    try:
        variant = ProductVariant.objects.get(id=variant_id)
    except ProductVariant.DoesNotExist:
        raise ProductNotFoundError()

    variant.is_active = False
    variant.save()
