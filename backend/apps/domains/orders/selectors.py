"""
Order selector functions following HackSoft Django style guide.

This module contains optimized database queries for order data retrieval.
All functions return QuerySets or model instances with proper prefetching.
"""

from typing import Optional
from uuid import UUID

from django.db.models import Prefetch, Q, QuerySet

from .models import Order, OrderItem, OrderStatus


def order_get_all(
    *,
    customer_id: Optional[UUID] = None,
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    vendor_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
) -> QuerySet[Order]:
    """
    Get all orders with optional filtering.

    Args:
        customer_id: Filter by customer UUID
        status: Filter by order status
        payment_status: Filter by payment status
        vendor_id: Filter by vendor UUID (returns orders containing vendor's items)
        is_active: Filter by active status

    Returns:
        QuerySet of Order objects with optimized prefetching
    """
    qs = Order.objects.all()

    if customer_id is not None:
        qs = qs.filter(customer_id=customer_id)

    if status is not None:
        qs = qs.filter(status=status)

    if payment_status is not None:
        qs = qs.filter(payment_status=payment_status)

    if vendor_id is not None:
        # Filter orders that contain items from this vendor
        qs = qs.filter(orderitem_set__vendor_id=vendor_id).distinct()

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return (
        qs.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related("variant", "variant__product", "vendor"),
                to_attr="prefetched_items",
            )
        )
        .order_by("-created_at")
    )


def order_get_by_id(*, order_id: UUID) -> Order:
    """
    Get a single order by ID with full relations.

    Args:
        order_id: Order UUID

    Returns:
        Order instance with all related data

    Raises:
        Order.DoesNotExist: If order not found
    """
    return (
        Order.objects.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related(
                    "variant", "variant__product", "vendor"
                ).order_by("created_at"),
                to_attr="prefetched_items",
            )
        )
        .get(id=order_id)
    )


def order_get_by_number(*, order_number: str) -> Order:
    """
    Get a single order by order number.

    Args:
        order_number: Order number string

    Returns:
        Order instance with all related data

    Raises:
        Order.DoesNotExist: If order not found
    """
    return (
        Order.objects.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related(
                    "variant", "variant__product", "vendor"
                ).order_by("created_at"),
                to_attr="prefetched_items",
            )
        )
        .get(order_number=order_number)
    )


def order_item_get_all(
    *,
    order_id: Optional[UUID] = None,
    vendor_id: Optional[UUID] = None,
    variant_id: Optional[UUID] = None,
    fulfillment_status: Optional[str] = None,
    is_refunded: Optional[bool] = None,
    is_active: Optional[bool] = None,
) -> QuerySet[OrderItem]:
    """
    Get all order items with optional filtering.

    Args:
        order_id: Filter by order UUID
        vendor_id: Filter by vendor UUID
        variant_id: Filter by product variant UUID
        fulfillment_status: Filter by fulfillment status
        is_refunded: Filter by refund status
        is_active: Filter by active status

    Returns:
        QuerySet of OrderItem objects with optimized prefetching
    """
    qs = OrderItem.objects.all()

    if order_id is not None:
        qs = qs.filter(order_id=order_id)

    if vendor_id is not None:
        qs = qs.filter(vendor_id=vendor_id)

    if variant_id is not None:
        qs = qs.filter(variant_id=variant_id)

    if fulfillment_status is not None:
        qs = qs.filter(fulfillment_status=fulfillment_status)

    if is_refunded is not None:
        qs = qs.filter(is_refunded=is_refunded)

    if is_active is not None:
        qs = qs.filter(is_active=is_active)

    return qs.select_related(
        "order", "variant", "variant__product", "vendor", "order__customer", "order__customer__user"
    ).order_by("-created_at")


def order_item_get_by_id(*, order_item_id: UUID) -> OrderItem:
    """
    Get a single order item by ID with full relations.

    Args:
        order_item_id: OrderItem UUID

    Returns:
        OrderItem instance with all related data

    Raises:
        OrderItem.DoesNotExist: If order item not found
    """
    return OrderItem.objects.select_related(
        "order", "variant", "variant__product", "vendor", "order__customer", "order__customer__user"
    ).get(id=order_item_id)


def order_get_for_customer(
    *, customer_id: UUID, status: Optional[str] = None, limit: Optional[int] = None
) -> QuerySet[Order]:
    """
    Get orders for a specific customer with optional status filter.

    Args:
        customer_id: Customer UUID
        status: Optional status filter
        limit: Optional limit for number of results

    Returns:
        QuerySet of Order objects for the customer
    """
    qs = Order.objects.filter(customer_id=customer_id)

    if status is not None:
        qs = qs.filter(status=status)

    qs = (
        qs.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related("variant", "variant__product"),
                to_attr="prefetched_items",
            )
        )
        .order_by("-created_at")
    )

    if limit is not None:
        qs = qs[:limit]

    return qs


def order_get_for_vendor(
    *, vendor_id: UUID, fulfillment_status: Optional[str] = None, limit: Optional[int] = None
) -> QuerySet[OrderItem]:
    """
    Get order items for a specific vendor.

    Args:
        vendor_id: Vendor UUID
        fulfillment_status: Optional fulfillment status filter
        limit: Optional limit for number of results

    Returns:
        QuerySet of OrderItem objects for the vendor
    """
    qs = OrderItem.objects.filter(vendor_id=vendor_id)

    if fulfillment_status is not None:
        qs = qs.filter(fulfillment_status=fulfillment_status)

    qs = qs.select_related(
        "order", "variant", "variant__product", "order__customer", "order__customer__user"
    ).order_by("-created_at")

    if limit is not None:
        qs = qs[:limit]

    return qs


def order_get_pending_fulfillment(*, vendor_id: Optional[UUID] = None) -> QuerySet[OrderItem]:
    """
    Get order items that need fulfillment (pending/placed status).

    Args:
        vendor_id: Optional vendor UUID to filter by vendor

    Returns:
        QuerySet of OrderItem objects pending fulfillment
    """
    qs = OrderItem.objects.filter(fulfillment_status__in=[OrderStatus.PENDING, OrderStatus.PLACED])

    if vendor_id is not None:
        qs = qs.filter(vendor_id=vendor_id)

    return qs.select_related(
        "order", "variant", "variant__product", "vendor", "order__customer", "order__customer__user"
    ).order_by("created_at")


def order_get_by_date_range(
    *, start_date, end_date, customer_id: Optional[UUID] = None, vendor_id: Optional[UUID] = None
) -> QuerySet[Order]:
    """
    Get orders within a date range with optional customer/vendor filtering.

    Args:
        start_date: Start date for filtering
        end_date: End date for filtering
        customer_id: Optional customer UUID filter
        vendor_id: Optional vendor UUID filter

    Returns:
        QuerySet of Order objects within date range
    """
    qs = Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

    if customer_id is not None:
        qs = qs.filter(customer_id=customer_id)

    if vendor_id is not None:
        qs = qs.filter(orderitem_set__vendor_id=vendor_id).distinct()

    return (
        qs.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related("variant", "variant__product", "vendor"),
                to_attr="prefetched_items",
            )
        )
        .order_by("-created_at")
    )


def order_search(*, query: str, customer_id: Optional[UUID] = None) -> QuerySet[Order]:
    """
    Search orders by order number, customer email, or customer name.

    Args:
        query: Search query string
        customer_id: Optional customer UUID to limit search to customer's orders

    Returns:
        QuerySet of Order objects matching search query
    """
    qs = Order.objects.filter(
        Q(order_number__icontains=query)
        | Q(customer__user__email__icontains=query)
        | Q(customer__user__full_name__icontains=query)
        | Q(shipping_address__full_name__icontains=query)
    )

    if customer_id is not None:
        qs = qs.filter(customer_id=customer_id)

    return (
        qs.select_related("customer", "customer__user")
        .prefetch_related(
            Prefetch(
                "orderitem_set",
                queryset=OrderItem.objects.select_related("variant", "variant__product", "vendor"),
                to_attr="prefetched_items",
            )
        )
        .order_by("-created_at")
    )
