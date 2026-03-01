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

from core.exceptions import ProductNotFoundError

from ..models.product import Product, ProductVariant


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
