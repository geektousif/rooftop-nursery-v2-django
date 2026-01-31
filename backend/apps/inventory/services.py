"""
Inventory service functions following HackSoft Django style guide.

This module contains business logic for inventory management operations.
All functions use keyword-only arguments and return model instances.
"""
from typing import Optional
from uuid import UUID

from django.db import transaction
from django.db import models

from apps.inventory.models import Stock, InventoryLog, InventoryAction
from apps.products.models import ProductVariant
from core.exceptions import InsufficientStockError


@transaction.atomic
def stock_create(
    *,
    variant: ProductVariant,
    quantity: int,
    low_stock_threshold: int = 0,
) -> Stock:
    """
    Create stock record for a product variant.
    
    Args:
        variant: ProductVariant instance
        quantity: Initial stock quantity
        low_stock_threshold: Low stock threshold (default: 0)
    
    Returns:
        Created Stock instance
    
    Raises:
        ValueError: If stock already exists for variant
    """
    if hasattr(variant, 'stock'):
        raise ValueError("Stock already exists for this variant")
    
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")
    
    stock = Stock.objects.create(
        variant=variant,
        quantity=quantity,
        low_stock_threshold=low_stock_threshold,
        reserved_quantity=0
    )
    
    # Create initial inventory log
    InventoryLog.objects.create(
        variant=variant,
        change_quantity=quantity,
        action_type=InventoryAction.RESTOCK,
        previous_quantity=0,
        reference_type="initial_setup"
    )
    
    return stock


@transaction.atomic
def stock_update(
    *,
    stock_id: UUID,
    quantity: Optional[int] = None,
    low_stock_threshold: Optional[int] = None,
) -> Stock:
    """
    Update stock record.
    
    Args:
        stock_id: Stock UUID
        quantity: New quantity (optional)
        low_stock_threshold: New low stock threshold (optional)
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        ValueError: If quantity is negative
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    if quantity is not None:
        if quantity < 0:
            raise ValueError("Quantity cannot be negative")
        
        previous_quantity = stock.quantity
        stock.quantity = quantity
        
        # Create inventory log for manual adjustment
        InventoryLog.objects.create(
            variant=stock.variant,
            change_quantity=quantity - previous_quantity,
            action_type=InventoryAction.ADJUSTMENT,
            previous_quantity=previous_quantity,
            reference_type="manual_update"
        )
    
    if low_stock_threshold is not None:
        if low_stock_threshold < 0:
            raise ValueError("Low stock threshold cannot be negative")
        stock.low_stock_threshold = low_stock_threshold
    
    stock.save()
    return stock


@transaction.atomic
def stock_restock(
    *,
    stock_id: UUID,
    quantity: int,
    batch_number: Optional[str] = None,
    supplier: Optional[str] = None,
    cost_per_unit: Optional[float] = None,
) -> Stock:
    """
    Add stock to existing inventory.
    
    Args:
        stock_id: Stock UUID
        quantity: Quantity to add
        batch_number: Optional batch number
        supplier: Optional supplier name
        cost_per_unit: Optional cost per unit
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        ValueError: If quantity is not positive
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    if quantity <= 0:
        raise ValueError("Restock quantity must be positive")
    
    previous_quantity = stock.quantity
    stock.quantity += quantity
    stock.save()
    
    # Create inventory log
    log = InventoryLog.objects.create(
        variant=stock.variant,
        change_quantity=quantity,
        action_type=InventoryAction.RESTOCK,
        previous_quantity=previous_quantity,
        reference_type="restock"
    )
    
    # Store additional metadata in reference_id as JSON
    metadata = {}
    if batch_number:
        metadata['batch_number'] = batch_number
    if supplier:
        metadata['supplier'] = supplier
    if cost_per_unit:
        metadata['cost_per_unit'] = cost_per_unit
    
    if metadata:
        log.reference_id = str(metadata)
        log.save()
    
    return stock


@transaction.atomic
def stock_reserve(
    *,
    stock_id: UUID,
    quantity: int,
    reference_id: Optional[UUID] = None,
    reference_type: Optional[str] = None,
) -> Stock:
    """
    Reserve stock for an order.
    
    Args:
        stock_id: Stock UUID
        quantity: Quantity to reserve
        reference_id: Optional reference ID (e.g., order ID)
        reference_type: Optional reference type (e.g., 'order')
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        InsufficientStockError: If insufficient available stock
        ValueError: If quantity is not positive
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    if quantity <= 0:
        raise ValueError("Reserve quantity must be positive")
    
    if stock.available_quantity < quantity:
        raise InsufficientStockError(
            f"Insufficient stock. Available: {stock.available_quantity}, Requested: {quantity}"
        )
    
    stock.reserved_quantity += quantity
    stock.save()
    
    # Create inventory log
    InventoryLog.objects.create(
        variant=stock.variant,
        change_quantity=-quantity,
        action_type=InventoryAction.RESERVE,
        previous_quantity=stock.quantity,
        reference_id=reference_id,
        reference_type=reference_type or "reservation"
    )
    
    return stock


@transaction.atomic
def stock_release(
    *,
    stock_id: UUID,
    quantity: int,
    reference_id: Optional[UUID] = None,
    reference_type: Optional[str] = None,
) -> Stock:
    """
    Release reserved stock.
    
    Args:
        stock_id: Stock UUID
        quantity: Quantity to release
        reference_id: Optional reference ID
        reference_type: Optional reference type
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        ValueError: If quantity is not positive or exceeds reserved quantity
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    if quantity <= 0:
        raise ValueError("Release quantity must be positive")
    
    if stock.reserved_quantity < quantity:
        raise ValueError(f"Cannot release more than reserved. Reserved: {stock.reserved_quantity}, Requested: {quantity}")
    
    stock.reserved_quantity -= quantity
    stock.save()
    
    # Create inventory log
    InventoryLog.objects.create(
        variant=stock.variant,
        change_quantity=quantity,
        action_type=InventoryAction.RETURN,
        previous_quantity=stock.quantity,
        reference_id=reference_id,
        reference_type=reference_type or "release"
    )
    
    return stock


@transaction.atomic
def stock_consume(
    *,
    stock_id: UUID,
    quantity: int,
    reference_id: Optional[UUID] = None,
    reference_type: Optional[str] = None,
) -> Stock:
    """
    Consume stock (actual sale).
    
    Args:
        stock_id: Stock UUID
        quantity: Quantity to consume
        reference_id: Optional reference ID (e.g., order ID)
        reference_type: Optional reference type (e.g., 'order')
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        InsufficientStockError: If insufficient stock
        ValueError: If quantity is not positive
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    if quantity <= 0:
        raise ValueError("Consume quantity must be positive")
    
    if stock.reserved_quantity < quantity:
        raise InsufficientStockError(
            f"Insufficient reserved stock. Reserved: {stock.reserved_quantity}, Requested: {quantity}"
        )
    
    previous_quantity = stock.quantity
    stock.quantity -= quantity
    stock.reserved_quantity -= quantity
    stock.save()
    
    # Create inventory log
    InventoryLog.objects.create(
        variant=stock.variant,
        change_quantity=-quantity,
        action_type=InventoryAction.SALE,
        previous_quantity=previous_quantity,
        reference_id=reference_id,
        reference_type=reference_type or "sale"
    )
    
    return stock


@transaction.atomic
def stock_adjust(
    *,
    stock_id: UUID,
    quantity: int,
    reason: str,
    reference_id: Optional[UUID] = None,
) -> Stock:
    """
    Manual stock adjustment (positive or negative).
    
    Args:
        stock_id: Stock UUID
        quantity: Adjustment amount (can be positive or negative)
        reason: Adjustment reason
        reference_id: Optional reference ID
    
    Returns:
        Updated Stock instance
    
    Raises:
        Stock.DoesNotExist: If stock not found
        ValueError: If adjustment would result in negative stock
    """
    try:
        stock = Stock.objects.get(id=stock_id)
    except Stock.DoesNotExist:
        raise ValueError("Stock not found")
    
    new_quantity = stock.quantity + quantity
    if new_quantity < 0:
        raise ValueError("Adjustment would result in negative stock")
    
    previous_quantity = stock.quantity
    stock.quantity = new_quantity
    
    # Adjust reserved quantity if needed
    if quantity < 0 and stock.reserved_quantity > new_quantity:
        stock.reserved_quantity = new_quantity
    
    stock.save()
    
    # Create inventory log
    InventoryLog.objects.create(
        variant=stock.variant,
        change_quantity=quantity,
        action_type=InventoryAction.ADJUSTMENT,
        previous_quantity=previous_quantity,
        reference_id=reference_id,
        reference_type=f"manual_adjustment: {reason}"
    )
    
    return stock


def stock_get_or_create(*, variant: ProductVariant, **kwargs) -> Stock:
    """
    Get existing stock or create new one.
    
    Args:
        variant: ProductVariant instance
        **kwargs: Additional arguments for stock creation
    
    Returns:
        Stock instance
    """
    stock, created = Stock.objects.get_or_create(
        variant=variant,
        defaults={
            'quantity': 0,
            'reserved_quantity': 0,
            'low_stock_threshold': kwargs.get('low_stock_threshold', 0)
        }
    )
    
    if created:
        # Create initial inventory log
        InventoryLog.objects.create(
            variant=variant,
            change_quantity=0,
            action_type=InventoryAction.RESTOCK,
            previous_quantity=0,
            reference_type="auto_create"
        )
    
    return stock


def stock_get_low_stock(*, vendor_id: Optional[UUID] = None) -> list:
    """
    Get variants with low stock.
    
    Args:
        vendor_id: Optional vendor UUID to filter by vendor
    
    Returns:
        List of Stock objects with low stock
    """
    qs = Stock.objects.filter(
        available_quantity__lte=models.F('low_stock_threshold')
    ).select_related('variant', 'variant__product')
    
    if vendor_id is not None:
        qs = qs.filter(variant__product__vendor_id=vendor_id)
    
    return list(qs)


def stock_get_out_of_stock(*, vendor_id: Optional[UUID] = None) -> list:
    """
    Get variants that are out of stock.
    
    Args:
        vendor_id: Optional vendor UUID to filter by vendor
    
    Returns:
        List of Stock objects with no available stock
    """
    qs = Stock.objects.filter(available_quantity=0).select_related('variant', 'variant__product')
    
    if vendor_id is not None:
        qs = qs.filter(variant__product__vendor_id=vendor_id)
    
    return list(qs)