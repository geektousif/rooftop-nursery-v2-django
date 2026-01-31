"""
Order views following HackSoft Django style guide.

Thin controllers that delegate business logic to services and data retrieval to selectors.
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from django.utils import timezone

from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from apps.orders.selectors import (
    order_get_all,
    order_get_by_id,
    order_get_by_number,
    order_item_get_all,
    order_item_get_by_id,
    order_get_for_customer,
    order_get_for_vendor,
    order_get_pending_fulfillment,
    order_search,
)
from apps.orders.services import (
    order_create,
    order_confirm,
    order_ship,
    order_deliver,
    order_cancel,
    order_item_ship,
    order_item_cancel,
)
from apps.orders.serializers import (
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
    OrderItemCreateSerializer,
)
from core.pagination import CursorPagination
from core.permissions import IsAuthenticated, IsVendor, IsCustomer, IsAdmin


class OrderListAPIView(APIView):
    """List orders with optional filtering."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="List orders",
        responses={200: OrderListSerializer(many=True)},
    )
    def get(self, request):
        # Extract filters
        filters = {
            'customer_id': request.query_params.get('customer_id'),
            'status': request.query_params.get('status'),
            'payment_status': request.query_params.get('payment_status'),
            'vendor_id': request.query_params.get('vendor_id'),
            'is_active': request.query_params.get('is_active'),
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # Call selector
        orders = order_get_all(**filters)
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(orders, request)
        
        # Serialize
        serializer = OrderListSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class OrderCreateAPIView(APIView):
    """Create a new order."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Create order",
        request=OrderCreateSerializer,
        responses={201: OrderSerializer},
    )
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            order = order_create(
                customer=request.user.customer if hasattr(request.user, 'customer') else None,
                **serializer.validated_data
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderDetailAPIView(APIView):
    """Get order details by ID or order number."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get order details",
        responses={200: OrderSerializer},
    )
    def get(self, request, order_id=None, order_number=None):
        try:
            if order_id:
                order = order_get_by_id(order_id=order_id)
            elif order_number:
                order = order_get_by_number(order_number=order_number)
            else:
                return Response(
                    {'error': 'Order ID or number required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not request.user.is_staff:
            if hasattr(request.user, 'customer') and order.customer != request.user.customer:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            elif hasattr(request.user, 'vendor'):
                # Vendors can only see orders containing their items
                if not order.orderitem_set.filter(vendor=request.user.vendor).exists():
                    return Response(
                        {'error': 'Access denied'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        return Response(OrderSerializer(order).data)


class OrderConfirmAPIView(APIView):
    """Confirm an order."""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="Confirm order",
        responses={200: OrderSerializer},
    )
    def post(self, request, order_id):
        try:
            order = order_confirm(order_id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(OrderSerializer(order).data)


class OrderShipAPIView(APIView):
    """Mark an order as shipped."""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="Ship order",
        responses={200: OrderSerializer},
    )
    def post(self, request, order_id):
        tracking_number = request.data.get('tracking_number')
        
        try:
            order = order_ship(order_id=order_id, tracking_number=tracking_number)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(OrderSerializer(order).data)


class OrderDeliverAPIView(APIView):
    """Mark an order as delivered."""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="Deliver order",
        responses={200: OrderSerializer},
    )
    def post(self, request, order_id):
        try:
            order = order_deliver(order_id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(OrderSerializer(order).data)


class OrderCancelAPIView(APIView):
    """Cancel an order."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Cancel order",
        responses={200: OrderSerializer},
    )
    def post(self, request, order_id):
        reason = request.data.get('reason')
        
        try:
            order = order_cancel(order_id=order_id, reason=reason)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions - customers can only cancel their own orders
        if hasattr(request.user, 'customer') and order.customer != request.user.customer:
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response(OrderSerializer(order).data)


class OrderItemListAPIView(APIView):
    """List order items with optional filtering."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="List order items",
        responses={200: OrderItemSerializer(many=True)},
    )
    def get(self, request):
        # Extract filters
        filters = {
            'order_id': request.query_params.get('order_id'),
            'vendor_id': request.query_params.get('vendor_id'),
            'variant_id': request.query_params.get('variant_id'),
            'fulfillment_status': request.query_params.get('fulfillment_status'),
            'is_refunded': request.query_params.get('is_refunded'),
            'is_active': request.query_params.get('is_active'),
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # Vendor filtering - vendors can only see their own items
        if hasattr(request.user, 'vendor'):
            filters['vendor_id'] = request.user.vendor.id
        
        # Call selector
        order_items = order_item_get_all(**filters)
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(order_items, request)
        
        # Serialize
        serializer = OrderItemSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class OrderItemDetailAPIView(APIView):
    """Get order item details."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get order item details",
        responses={200: OrderItemSerializer},
    )
    def get(self, request, order_item_id):
        try:
            order_item = order_item_get_by_id(order_item_id=order_item_id)
        except OrderItem.DoesNotExist:
            return Response(
                {'error': 'Order item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not request.user.is_staff:
            if hasattr(request.user, 'customer') and order_item.order.customer != request.user.customer:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            elif hasattr(request.user, 'vendor') and order_item.vendor != request.user.vendor:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return Response(OrderItemSerializer(order_item).data)


class OrderItemShipAPIView(APIView):
    """Mark an order item as shipped (vendor endpoint)."""
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Ship order item",
        responses={200: OrderItemSerializer},
    )
    def post(self, request, order_item_id):
        tracking_number = request.data.get('tracking_number')
        carrier = request.data.get('carrier')
        
        try:
            order_item = order_item_get_by_id(order_item_id=order_item_id)
            
            # Check vendor ownership
            if order_item.vendor != request.user.vendor:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            order_item = order_item_ship(
                order_item_id=order_item_id,
                tracking_number=tracking_number,
                carrier=carrier
            )
        except OrderItem.DoesNotExist:
            return Response(
                {'error': 'Order item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(OrderItemSerializer(order_item).data)


class OrderItemCancelAPIView(APIView):
    """Cancel an order item (vendor endpoint)."""
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Cancel order item",
        responses={200: OrderItemSerializer},
    )
    def post(self, request, order_item_id):
        reason = request.data.get('reason')
        
        try:
            order_item = order_item_get_by_id(order_item_id=order_item_id)
            
            # Check vendor ownership
            if order_item.vendor != request.user.vendor:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            order_item = order_item_cancel(
                order_item_id=order_item_id,
                reason=reason
            )
        except OrderItem.DoesNotExist:
            return Response(
                {'error': 'Order item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderCancellationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(OrderItemSerializer(order_item).data)


class CustomerOrderListAPIView(APIView):
    """Get orders for the authenticated customer."""
    permission_classes = [IsAuthenticated, IsCustomer]
    
    @extend_schema(
        summary="Get my orders",
        responses={200: OrderListSerializer(many=True)},
    )
    def get(self, request):
        status_filter = request.query_params.get('status')
        limit = request.query_params.get('limit')
        
        if limit:
            limit = int(limit)
        
        orders = order_get_for_customer(
            customer_id=request.user.customer.id,
            status=status_filter,
            limit=limit
        )
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(orders, request)
        
        # Serialize
        serializer = OrderListSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class VendorOrderItemListAPIView(APIView):
    """Get order items for the authenticated vendor."""
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Get my order items",
        responses={200: OrderItemSerializer(many=True)},
    )
    def get(self, request):
        fulfillment_status = request.query_params.get('fulfillment_status')
        limit = request.query_params.get('limit')
        
        if limit:
            limit = int(limit)
        
        order_items = order_get_for_vendor(
            vendor_id=request.user.vendor.id,
            fulfillment_status=fulfillment_status,
            limit=limit
        )
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(order_items, request)
        
        # Serialize
        serializer = OrderItemSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class VendorPendingFulfillmentAPIView(APIView):
    """Get pending fulfillment items for the authenticated vendor."""
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Get pending fulfillment items",
        responses={200: OrderItemSerializer(many=True)},
    )
    def get(self, request):
        order_items = order_get_pending_fulfillment(vendor_id=request.user.vendor.id)
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(order_items, request)
        
        # Serialize
        serializer = OrderItemSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class OrderSearchAPIView(APIView):
    """Search orders."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Search orders",
        responses={200: OrderListSerializer(many=True)},
    )
    def get(self, request):
        query = request.query_params.get('q')
        if not query:
            return Response(
                {'error': 'Search query required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        customer_id = None
        if hasattr(request.user, 'customer'):
            customer_id = request.user.customer.id
        
        orders = order_search(query=query, customer_id=customer_id)
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(orders, request)
        
        # Serialize
        serializer = OrderListSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)