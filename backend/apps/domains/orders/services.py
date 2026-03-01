"""
Order service functions following HackSoft Django style guide.

This module contains business logic for order management operations.
All functions use keyword-only arguments and return model instances.
"""

from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from django.db import transaction
from django.utils import timezone

from apps.domains.customers.models import Customer
from apps.domains.products.models.product import ProductVariant
from core.exceptions import (
    InsufficientStockError,
    OrderCancellationError,
    OrderNotFoundError,
    ProductNotFoundError,
)

from .models import Order, OrderItem, OrderStatus, PaymentStatus


@transaction.atomic
def order_create(
    *,
    customer: Optional[Customer] = None,
    items: List[dict],
    shipping_address: dict,
    billing_address: Optional[dict] = None,
    coupon_code_applied: Optional[str] = None,
    notes: Optional[str] = None,
) -> Order:
    """
    Create a new order with order items.

    Args:
        customer: Customer instance (None for guest orders)
        items: List of item dicts with variant_id, quantity, unit_price
        shipping_address: Shipping address dictionary
        billing_address: Billing address dictionary (optional)
        coupon_code_applied: Applied coupon code (optional)
        notes: Order notes (optional)

    Returns:
        Created Order instance

    Raises:
        ProductNotFoundError: If any product variant is not found
        InsufficientStockError: If insufficient stock available
    """
    if not items:
        raise ValueError("Order must have at least one item")

    # Calculate order totals
    subtotal_amount = Decimal("0.00")
    total_quantity = 0
    order_items = []

    for item_data in items:
        try:
            variant = ProductVariant.objects.get(id=item_data["variant_id"])
        except ProductVariant.DoesNotExist:
            raise ProductNotFoundError(f"Variant {item_data['variant_id']} not found")

        quantity = item_data["quantity"]
        unit_price = Decimal(str(item_data["unit_price"]))
        total_amount = quantity * unit_price

        # Check stock availability
        if hasattr(variant, "stock"):
            if variant.stock.available_quantity < quantity:
                raise InsufficientStockError(
                    f"Insufficient stock for {variant.product.name} - {variant.name}"
                )

        subtotal_amount += total_amount
        total_quantity += quantity

        order_items.append(
            {
                "variant": variant,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_amount": total_amount,
                "vendor": variant.product.vendor,
            }
        )

    # Create order
    order = Order.objects.create(
        customer=customer,
        total_quantity=total_quantity,
        subtotal_amount=subtotal_amount,
        tax_amount=Decimal("0.00"),  # Calculate tax based on location
        shipping_amount=Decimal("0.00"),  # Calculate based on shipping method
        discount_amount=Decimal("0.00"),  # Calculate from coupon
        grand_total=subtotal_amount,  # Will be updated with tax, shipping, discount
        shipping_address=shipping_address,
        billing_address=billing_address,
        coupon_code_applied=coupon_code_applied,
        notes=notes,
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
    )

    # Create order items
    for item_data in order_items:
        OrderItem.objects.create(
            order=order,
            variant=item_data["variant"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total_amount=item_data["total_amount"],
            vendor=item_data["vendor"],
            product_snapshot={
                "product_name": item_data["variant"].product.name,
                "variant_name": item_data["variant"].name,
                "sku": item_data["variant"].sku,
                "unit_price": str(item_data["unit_price"]),
            },
        )

    return order


@transaction.atomic
def order_confirm(*, order_id: UUID) -> Order:
    """
    Confirm an order (change status from PENDING to PLACED).

    Args:
        order_id: Order UUID

    Returns:
        Updated Order instance

    Raises:
        OrderNotFoundError: If order not found
        OrderCancellationError: If order cannot be confirmed
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        raise OrderNotFoundError()

    if order.status != OrderStatus.PENDING:
        raise OrderCancellationError("Only pending orders can be confirmed")

    order.status = OrderStatus.PLACED
    order.confirmed_at = timezone.now()
    order.save()

    # Reserve stock for each order item
    for item in order.order_items_set.all():
        if hasattr(item.variant, "stock"):
            item.variant.stock.reserved_quantity += item.quantity
            item.variant.stock.save()

    return order


@transaction.atomic
def order_ship(*, order_id: UUID, tracking_number: Optional[str] = None) -> Order:
    """
    Mark an order as shipped.

    Args:
        order_id: Order UUID
        tracking_number: Optional tracking number

    Returns:
        Updated Order instance

    Raises:
        OrderNotFoundError: If order not found
        OrderCancellationError: If order cannot be shipped
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        raise OrderNotFoundError()

    if order.status not in [OrderStatus.PLACED, OrderStatus.SHIPPED]:
        raise OrderCancellationError("Only placed orders can be shipped")

    order.status = OrderStatus.SHIPPED
    order.shipped_at = timezone.now()

    # Update tracking number for all order items
    if tracking_number:
        order.order_items_set.update(tracking_number=tracking_number)

    order.save()

    # Deduct stock for each order item
    for item in order.order_items_set.all():
        if hasattr(item.variant, "stock"):
            stock = item.variant.stock
            stock.quantity -= item.quantity
            stock.reserved_quantity -= item.quantity
            stock.save()

    return order


@transaction.atomic
def order_deliver(*, order_id: UUID) -> Order:
    """
    Mark an order as delivered.

    Args:
        order_id: Order UUID

    Returns:
        Updated Order instance

    Raises:
        OrderNotFoundError: If order not found
        OrderCancellationError: If order cannot be delivered
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        raise OrderNotFoundError()

    if order.status != OrderStatus.SHIPPED:
        raise OrderCancellationError("Only shipped orders can be delivered")

    order.status = OrderStatus.DELIVERED
    order.delivered_at = timezone.now()
    order.save()

    return order


@transaction.atomic
def order_cancel(*, order_id: UUID, reason: Optional[str] = None) -> Order:
    """
    Cancel an order.

    Args:
        order_id: Order UUID
        reason: Cancellation reason

    Returns:
        Updated Order instance

    Raises:
        OrderNotFoundError: If order not found
        OrderCancellationError: If order cannot be cancelled
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        raise OrderNotFoundError()

    if order.status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
        raise OrderCancellationError("Cannot cancel delivered or already cancelled orders")

    order.status = OrderStatus.CANCELLED
    order.cancelled_at = timezone.now()
    order.cancellation_reason = reason or "Customer requested cancellation"
    order.save()

    # Release reserved stock for each order item
    for item in order.order_items_set.all():
        if hasattr(item.variant, "stock"):
            stock = item.variant.stock
            if order.status == OrderStatus.PLACED:
                # If order was placed, restore reserved stock to available stock
                stock.reserved_quantity -= item.quantity
            elif order.status == OrderStatus.SHIPPED:
                # If order was shipped, restore actual stock
                stock.quantity += item.quantity
                stock.reserved_quantity -= item.quantity
            stock.save()

    return order


@transaction.atomic
def order_item_ship(
    *, order_item_id: UUID, tracking_number: Optional[str] = None, carrier: Optional[str] = None
) -> OrderItem:
    """
    Mark an individual order item as shipped (for vendor fulfillment).

    Args:
        order_item_id: OrderItem UUID
        tracking_number: Optional tracking number
        carrier: Optional carrier name

    Returns:
        Updated OrderItem instance

    Raises:
        OrderNotFoundError: If order item not found
        OrderCancellationError: If item cannot be shipped
    """
    try:
        order_item = OrderItem.objects.get(id=order_item_id)
    except OrderItem.DoesNotExist:
        raise OrderNotFoundError("Order item not found")

    if order_item.fulfillment_status not in [OrderStatus.PENDING, OrderStatus.PLACED]:
        raise OrderCancellationError("Only pending or placed items can be shipped")

    order_item.fulfillment_status = OrderStatus.SHIPPED
    order_item.shipped_at = timezone.now()
    if tracking_number:
        order_item.tracking_number = tracking_number
    order_item.save()

    # Deduct stock
    if hasattr(order_item.variant, "stock"):
        stock = order_item.variant.stock
        stock.quantity -= order_item.quantity
        stock.reserved_quantity -= order_item.quantity
        stock.save()

    # Check if all items in the order are shipped
    order = order_item.order
    if all(item.fulfillment_status == OrderStatus.SHIPPED for item in order.order_items_set.all()):
        order.status = OrderStatus.SHIPPED
        order.shipped_at = timezone.now()
        order.save()

    return order_item


@transaction.atomic
def order_item_cancel(*, order_item_id: UUID, reason: Optional[str] = None) -> OrderItem:
    """
    Cancel an individual order item (for vendor fulfillment).

    Args:
        order_item_id: OrderItem UUID
        reason: Cancellation reason

    Returns:
        Updated OrderItem instance

    Raises:
        OrderNotFoundError: If order item not found
        OrderCancellationError: If item cannot be cancelled
    """
    try:
        order_item = OrderItem.objects.get(id=order_item_id)
    except OrderItem.DoesNotExist:
        raise OrderNotFoundError("Order item not found")

    if order_item.fulfillment_status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
        raise OrderCancellationError("Cannot cancel delivered or already cancelled items")

    order_item.fulfillment_status = OrderStatus.CANCELLED
    order_item.cancelled_at = timezone.now()
    order_item.cancellation_reason = reason or "Item cancelled"
    order_item.save()

    # Release reserved stock
    if hasattr(order_item.variant, "stock"):
        stock = order_item.variant.stock
        if order_item.order.status == OrderStatus.PLACED:
            stock.reserved_quantity -= order_item.quantity
        elif order_item.order.status == OrderStatus.SHIPPED:
            stock.quantity += order_item.quantity
            stock.reserved_quantity -= order_item.quantity
        stock.save()

    return order_item
