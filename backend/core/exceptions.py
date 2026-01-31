"""
Custom exception classes for the application.

All exceptions follow DRF APIException pattern for consistent error handling.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientStockError(APIException):
    """Raised when there's insufficient stock for an order."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Insufficient stock available'
    default_code = 'insufficient_stock'


class InvalidCouponError(APIException):
    """Raised when a coupon code is invalid or expired."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid or expired coupon'
    default_code = 'invalid_coupon'


class VendorNotApprovedError(APIException):
    """Raised when vendor tries to access restricted endpoints before approval."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Vendor account not approved yet'
    default_code = 'vendor_not_approved'


class PaymentFailedError(APIException):
    """Raised when payment processing fails."""
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Payment processing failed'
    default_code = 'payment_failed'


class OrderNotFoundError(APIException):
    """Raised when an order is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Order not found'
    default_code = 'order_not_found'


class OrderCancellationError(APIException):
    """Raised when order cannot be cancelled (wrong status, etc.)."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Order cannot be cancelled'
    default_code = 'order_cancellation_error'


class ProductNotFoundError(APIException):
    """Raised when a product is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Product not found'
    default_code = 'product_not_found'


class UnauthorizedAccessError(APIException):
    """Raised when user tries to access resource they don't own."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this resource'
    default_code = 'unauthorized_access'
