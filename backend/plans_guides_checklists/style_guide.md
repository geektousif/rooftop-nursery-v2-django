# 🌱 Rooftop Nursery Django Style Guide

> Based on [HackSoft Django Style Guide](https://github.com/HackSoftware/Django-Styleguide) with Rooftop-specific conventions.

---

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Project Structure](#project-structure)
3. [Models](#models)
4. [Services](#services)
5. [Selectors](#selectors)
6. [APIs & Views](#apis--views)
7. [Serializers](#serializers)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Performance Optimization](#performance-optimization)

---

## Architecture Principles

### The Golden Rules

1. **Fat Services, Thin Views** - Business logic lives in services, not views
2. **Explicit is Better** - No magic, no surprises
3. **Single Responsibility** - Each function does ONE thing
4. **Vendor Isolation First** - Every query must respect vendor boundaries
5. **Optimize Reads, Protect Writes** - Use selectors for reads, services for writes

### Layer Responsibilities

```
┌─────────────────────────────────────┐
│  Views (API Controllers)            │  ← Thin layer, handles HTTP only
│  - Authentication                   │
│  - Request validation               │
│  - Response formatting              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Services (Write Operations)        │  ← Business logic for writes
│  - Create orders                    │
│  - Update inventory                 │
│  - Process payments                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Selectors (Read Operations)        │  ← Optimized reads with prefetch
│  - Get products for storefront      │
│  - Get vendor orders                │
│  - Search products                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Models (Data Layer)                │  ← Minimal logic, data structure only
│  - Field definitions                │
│  - Meta options                     │
│  - Custom managers                  │
└─────────────────────────────────────┘
```

---

## Project Structure

```
rooftop_nursery/
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── services.py          # User creation, password reset
│   │   ├── selectors.py         # Get user profiles
│   │   ├── views.py             # API endpoints
│   │   ├── serializers.py
│   │   ├── permissions.py       # Custom DRF permissions
│   │   └── tests/
│   │       ├── test_services.py
│   │       ├── test_selectors.py
│   │       └── test_views.py
│   │
│   ├── products/
│   │   ├── models.py            # Product, ProductVariant
│   │   ├── services.py          # create_product, update_product
│   │   ├── selectors.py         # get_products_for_storefront
│   │   ├── views.py
│   │   └── serializers.py
│   │
│   ├── orders/
│   │   ├── models.py            # Order, OrderItem
│   │   ├── services.py          # create_order, cancel_order
│   │   ├── selectors.py         # get_customer_orders
│   │   ├── views.py
│   │   └── tasks.py             # Background tasks (email, etc.)
│   │
│   └── ...
│
├── core/
│   ├── middleware/
│   │   ├── vendor_isolation.py  # Attach vendor_id to request
│   │   └── exception_handler.py # Global error handling
│   │
│   ├── utils/
│   │   ├── validators.py        # Reusable validators
│   │   ├── helpers.py           # Utility functions
│   │   └── constants.py         # App-wide constants
│   │
│   ├── exceptions.py            # Custom exception classes
│   └── permissions.py           # Global permissions
│
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
│
└── infrastructure/
    ├── nginx/
    ├── gunicorn/
    └── scripts/
```

---

## Models

### Base Models

**Always use these abstract base models:**

```python
# core/models.py
import uuid
from django.db import models
from django.utils import timezone
from soft_delete.models import SoftDeleteModel

class UUIDModel(models.Model):
    """Provides UUIDv7 primary keys"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    
    class Meta:
        abstract = True

class TimeStampedModel(models.Model):
    """Provides created_at and updated_at timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel):
    """Combine all base functionality"""
    class Meta:
        abstract = True
```

### Model Conventions

**✅ DO:**

```python
class Product(BaseModel):
    """
    Base product entity for catalog.
    Represents the logical product (e.g., "Tomato Seeds").
    Actual sellable items are ProductVariant instances.
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    # Foreign Keys: ALWAYS use related_name
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.CASCADE,
        related_name='products'  # vendor.products.all()
    )
    category = models.ManyToManyField(
        'categories.Category',
        related_name='products'
    )
    
    # Flags
    is_active = models.BooleanField(default=True)
    
    class Meta:
        # Indexes for common query patterns
        indexes = [
            models.Index(fields=['vendor', 'is_active', '-created_at']),
            models.Index(fields=['slug']),
        ]
        # Constraints for data integrity
        unique_together = ['name', 'vendor']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
    
    def __str__(self):
        return f"{self.name} ({self.vendor.business_name})"
```

**❌ DON'T:**

```python
class Product(models.Model):  # ❌ Not using BaseModel
    id = models.AutoField(primary_key=True)  # ❌ Use UUIDv7
    name = models.CharField(max_length=255)
    
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE)  # ❌ No related_name
    
    def calculate_discount(self):  # ❌ Business logic in model
        return self.price * 0.9
    
    def send_notification(self):  # ❌ Side effects in model
        send_email(...)
```

### Custom Managers and QuerySets

**Use custom managers for reusable filters:**

```python
# apps/products/models.py
class ProductQuerySet(models.QuerySet):
    def active(self):
        """Return only active products"""
        return self.filter(is_active=True)
    
    def for_vendor(self, vendor_id):
        """Filter products by vendor (RLS)"""
        return self.filter(vendor_id=vendor_id)
    
    def with_variants(self):
        """Prefetch variants for efficiency"""
        return self.prefetch_related(
            Prefetch(
                'productvariants_set',
                queryset=ProductVariant.objects.filter(is_active=True)
            )
        )
    
    def for_storefront(self):
        """Optimized queryset for public display"""
        return (
            self.active()
            .select_related('vendor')
            .with_variants()
            .prefetch_related('category')
        )

class Product(BaseModel):
    # ... fields ...
    
    objects = ProductQuerySet.as_manager()
```

**Usage:**

```python
# Clean and chainable
products = Product.objects.active().for_vendor(vendor_id).for_storefront()
```

### Generated Fields (PostgreSQL 12+)

**Use `GeneratedField` for computed values:**

```python
class Stock(BaseModel):
    variant = models.OneToOneField('products.ProductVariant', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reserved_quantity = models.PositiveIntegerField(default=0)
    
    # Computed column (updated automatically)
    available_quantity = models.GeneratedField(
        expression=F('quantity') - F('reserved_quantity'),
        output_field=models.PositiveIntegerField(),
        db_persist=True,  # Stored in DB for indexing
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['available_quantity']),  # Can index generated fields
        ]
```

---

## Services

Services contain **write operations** and **business logic**.

### Service Conventions

**✅ DO:**

```python
# apps/orders/services.py
from django.db import transaction
from django.utils import timezone
from typing import Optional
from decimal import Decimal

from apps.orders.models import Order, OrderItem
from apps.customers.models import Customer
from apps.products.models import ProductVariant
from apps.inventory.services import reserve_inventory_for_order
from core.exceptions import InsufficientStockError, InvalidCouponError


@transaction.atomic
def create_order(
    *,  # Force keyword-only arguments
    customer: Customer,
    cart_items: list[dict],
    shipping_address: dict,
    billing_address: Optional[dict] = None,
    coupon_code: Optional[str] = None,
    notes: Optional[str] = None
) -> Order:
    """
    Create a new order with inventory reservation.
    
    Args:
        customer: Customer instance
        cart_items: List of dicts with keys: variant_id, quantity
        shipping_address: Dict with keys: full_name, phone, address, pin_code, etc.
        billing_address: Optional billing address (uses shipping if None)
        coupon_code: Optional coupon code to apply
        notes: Optional order notes
    
    Returns:
        Created Order instance
    
    Raises:
        InsufficientStockError: If any item is out of stock
        InvalidCouponError: If coupon is invalid or expired
    """
    # Step 1: Validate stock availability (SELECT FOR UPDATE)
    _validate_stock_availability(cart_items)
    
    # Step 2: Calculate pricing
    pricing = _calculate_order_pricing(cart_items, coupon_code)
    
    # Step 3: Create order
    order = Order.objects.create(
        customer=customer,
        order_number=_generate_order_number(),
        total_quantity=pricing['total_quantity'],
        subtotal_amount=pricing['subtotal'],
        tax_amount=pricing['tax'],
        shipping_amount=pricing['shipping'],
        discount_amount=pricing['discount'],
        grand_total=pricing['grand_total'],
        shipping_address=shipping_address,
        billing_address=billing_address or shipping_address,
        coupon_code_applied=coupon_code,
        notes=notes,
    )
    
    # Step 4: Create order items with vendor split
    for item in cart_items:
        variant = ProductVariant.objects.select_related(
            'product__vendor'
        ).get(id=item['variant_id'])
        
        OrderItem.objects.create(
            order=order,
            variant=variant,
            vendor=variant.product.vendor,
            quantity=item['quantity'],
            unit_price=variant.price,
            product_snapshot={
                'product_name': variant.product.name,
                'variant_name': variant.name,
                'sku': variant.sku,
                'price': str(variant.price),
                'mrp': str(variant.mrp),
            },
            total_amount=variant.price * item['quantity'],
            vendor_payout_amount=_calculate_vendor_payout(
                variant=variant,
                quantity=item['quantity'],
                total_amount=variant.price * item['quantity']
            ),
        )
    
    # Step 5: Reserve inventory
    reserve_inventory_for_order(order)
    
    # Step 6: Queue background tasks
    from apps.orders.tasks import send_order_confirmation_email
    send_order_confirmation_email.delay(str(order.id))
    
    return order


def _validate_stock_availability(cart_items: list[dict]) -> None:
    """
    Check if all items have sufficient stock.
    Uses SELECT FOR UPDATE to prevent race conditions.
    """
    from apps.inventory.models import Stock
    
    for item in cart_items:
        stock = Stock.objects.select_for_update().get(
            variant_id=item['variant_id']
        )
        
        if stock.available_quantity < item['quantity']:
            raise InsufficientStockError(
                f"Only {stock.available_quantity} units available for SKU {stock.variant.sku}"
            )


def _calculate_order_pricing(
    cart_items: list[dict],
    coupon_code: Optional[str] = None
) -> dict:
    """Calculate all pricing components for the order."""
    from apps.products.models import ProductVariant
    from apps.coupons.services import apply_coupon
    
    # Get all variants in one query
    variant_ids = [item['variant_id'] for item in cart_items]
    variants = ProductVariant.objects.in_bulk(variant_ids)
    
    subtotal = Decimal('0.00')
    total_quantity = 0
    
    for item in cart_items:
        variant = variants[item['variant_id']]
        subtotal += variant.price * item['quantity']
        total_quantity += item['quantity']
    
    # Apply coupon discount
    discount = Decimal('0.00')
    if coupon_code:
        discount = apply_coupon(coupon_code, subtotal, cart_items)
    
    # Calculate tax (18% GST for India)
    taxable_amount = subtotal - discount
    tax = (taxable_amount * Decimal('0.18')).quantize(Decimal('0.01'))
    
    # Calculate shipping (free above ₹500)
    shipping = Decimal('0.00') if subtotal >= 500 else Decimal('50.00')
    
    grand_total = subtotal + tax + shipping - discount
    
    return {
        'total_quantity': total_quantity,
        'subtotal': subtotal,
        'discount': discount,
        'tax': tax,
        'shipping': shipping,
        'grand_total': grand_total,
    }


def _calculate_vendor_payout(
    *,
    variant: ProductVariant,
    quantity: int,
    total_amount: Decimal
) -> Decimal:
    """
    Calculate vendor payout after platform commission.
    Admin takes commission_rate%, vendor gets the rest.
    """
    commission_rate = variant.product.vendor.commission_rate / 100
    platform_commission = total_amount * commission_rate
    vendor_payout = total_amount - platform_commission
    
    return vendor_payout.quantize(Decimal('0.01'))


def _generate_order_number() -> str:
    """Generate unique order number: ORD-20260123-XXXXXX"""
    import secrets
    from django.utils import timezone
    
    date_prefix = timezone.now().strftime('%Y%m%d')
    random_suffix = secrets.token_hex(3).upper()
    
    return f"ORD-{date_prefix}-{random_suffix}"
```

**Key Service Principles:**

1. **Use `@transaction.atomic`** for operations that modify multiple tables
2. **Force keyword arguments** with `*,` to prevent positional mistakes
3. **Type hints everywhere** for IDE support and documentation
4. **Raise custom exceptions** instead of returning error codes
5. **No model logic** - services orchestrate, models hold data
6. **Private helper functions** start with `_` (not exported)
7. **Return the created object** for further use (don't return dict)

**❌ DON'T:**

```python
# ❌ BAD: Business logic in view
def create_order(request):
    order = Order.objects.create(...)
    for item in request.data['items']:
        OrderItem.objects.create(...)
    # 50 lines of logic here
    return Response(...)

# ❌ BAD: Service without transaction
def create_order(customer, items):  # No transaction! Race conditions!
    order = Order.objects.create(...)
    # If this fails, order is created but items aren't

# ❌ BAD: Returning dict instead of object
def create_order(...) -> dict:  # Should return Order instance
    order = Order.objects.create(...)
    return {'id': order.id, 'total': order.grand_total}
```

---

## Selectors

Selectors handle **read operations** with optimal query patterns.

### Selector Conventions

**✅ DO:**

```python
# apps/products/selectors.py
from django.db.models import QuerySet, Prefetch, Q, Count, Avg
from typing import Optional

from apps.products.models import Product, ProductVariant
from apps.reviews.models import ProductReview


def get_products_for_storefront(
    *,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    vendor_id: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by: str = '-created_at'
) -> QuerySet[Product]:
    """
    Get optimized product listing for storefront.
    
    Returns QuerySet with:
    - All active products
    - Prefetched variants, images, vendor
    - Filtered by category/search/price
    - Sorted by specified field
    
    Usage:
        products = get_products_for_storefront(
            category_slug='seeds',
            search='tomato',
            sort_by='price'
        )
    """
    # Base queryset with all optimizations
    qs = Product.objects.filter(
        is_active=True
    ).select_related(
        'vendor'  # Avoid N+1 for vendor.business_name
    ).prefetch_related(
        # Prefetch active variants with stock
        Prefetch(
            'productvariants_set',
            queryset=ProductVariant.objects.filter(
                is_active=True
            ).select_related('stock').order_by('display_order')
        ),
        # Prefetch categories
        'category',
        # Prefetch display images only
        Prefetch(
            'productimage_set',
            queryset=ProductImage.objects.filter(
                is_display_image=True
            ).order_by('display_order')
        ),
    ).annotate(
        # Annotate for sorting/filtering
        avg_rating=Avg('productreview__rating'),
        review_count=Count('productreview'),
        min_variant_price=Min('productvariants__price'),
    )
    
    # Apply filters
    if category_slug:
        qs = qs.filter(category__slug=category_slug)
    
    if search:
        qs = qs.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search) |
            Q(tags__contains=[search])  # JSONField contains
        )
    
    if vendor_id:
        qs = qs.filter(vendor_id=vendor_id)
    
    if min_price:
        qs = qs.filter(min_variant_price__gte=min_price)
    
    if max_price:
        qs = qs.filter(min_variant_price__lte=max_price)
    
    # Apply sorting
    allowed_sorts = ['price', '-price', 'name', '-created_at', '-avg_rating']
    if sort_by in allowed_sorts:
        qs = qs.order_by(sort_by)
    else:
        qs = qs.order_by('-created_at')
    
    return qs


def get_product_detail(*, slug: str) -> Product:
    """
    Get single product with all relations for detail page.
    
    Raises:
        Product.DoesNotExist: If product not found or inactive
    """
    return Product.objects.filter(
        slug=slug,
        is_active=True
    ).select_related(
        'vendor'
    ).prefetch_related(
        'productvariants_set__stock',
        'productimage_set',
        'category',
        Prefetch(
            'productreview_set',
            queryset=ProductReview.objects.filter(
                is_verified=True
            ).order_by('-created_at')
        ),
    ).get()


def get_featured_products(*, limit: int = 10) -> QuerySet[Product]:
    """Get featured products for homepage."""
    return Product.objects.filter(
        is_active=True,
        is_featured=True
    ).select_related('vendor').prefetch_related(
        'productvariants_set__stock',
        'productimage_set'
    ).order_by('-created_at')[:limit]


def get_best_sellers(*, limit: int = 10) -> QuerySet[Product]:
    """
    Get best-selling products based on order count.
    Uses aggregation on OrderItem.
    """
    from apps.orders.models import OrderItem
    from django.db.models import Sum
    
    # Aggregate total quantity sold per product
    best_seller_ids = OrderItem.objects.values(
        'variant__product_id'
    ).annotate(
        total_sold=Sum('quantity')
    ).order_by('-total_sold')[:limit].values_list(
        'variant__product_id', flat=True
    )
    
    # Preserve ordering from aggregation
    preserved_order = Case(
        *[When(id=pk, then=pos) for pos, pk in enumerate(best_seller_ids)]
    )
    
    return Product.objects.filter(
        id__in=best_seller_ids,
        is_active=True
    ).select_related('vendor').prefetch_related(
        'productvariants_set__stock',
        'productimage_set'
    ).order_by(preserved_order)
```

**Key Selector Principles:**

1. **Always use `select_related` for ForeignKey/OneToOne** to avoid N+1
2. **Always use `prefetch_related` for ManyToMany/Reverse FKs**
3. **Use `Prefetch()` objects** for complex prefetching with filters
4. **Annotate computed fields** instead of calculating in Python
5. **Filter in the database**, not in Python (`.filter()` not list comprehension)
6. **Return QuerySets, not lists** for lazy evaluation
7. **Document query performance** with comments

---

## APIs & Views

Views are **thin controllers** - they handle HTTP, nothing else.

### View Conventions

**✅ DO:**

```python
# apps/products/views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.products.selectors import (
    get_products_for_storefront,
    get_product_detail,
)
from apps.products.services import create_product, update_product
from apps.products.serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
)
from core.permissions import IsVendor, IsVendorOwner
from core.pagination import CursorPagination


class ProductListAPIView(APIView):
    """
    Public endpoint for storefront product listing.
    No authentication required.
    """
    
    @extend_schema(
        summary="List products for storefront",
        description="Get paginated list of active products with filters",
        parameters=[
            OpenApiParameter(name='category', type=str, description='Category slug'),
            OpenApiParameter(name='search', type=str, description='Search query'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field'),
        ],
        responses={200: ProductListSerializer(many=True)},
    )
    def get(self, request):
        # Extract query params
        filters = {
            'category_slug': request.query_params.get('category'),
            'search': request.query_params.get('search'),
            'min_price': request.query_params.get('min_price'),
            'max_price': request.query_params.get('max_price'),
            'sort_by': request.query_params.get('sort_by', '-created_at'),
        }
        
        # Call selector (read operation)
        products = get_products_for_storefront(**filters)
        
        # Paginate
        paginator = CursorPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        
        # Serialize
        serializer = ProductListSerializer(paginated_products, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class ProductDetailAPIView(APIView):
    """Public product detail page."""
    
    @extend_schema(
        summary="Get product details",
        responses={
            200: ProductDetailSerializer,
            404: {"description": "Product not found"}
        },
    )
    def get(self, request, slug):
        try:
            product = get_product_detail(slug=slug)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)


class VendorProductCreateAPIView(APIView):
    """
    Vendor-only endpoint for creating products.
    Enforces vendor isolation via permission class.
    """
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Create product (vendor only)",
        request=ProductCreateSerializer,
        responses={
            201: ProductDetailSerializer,
            400: {"description": "Validation error"},
            403: {"description": "Not a vendor"},
        },
    )
    def post(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Service handles business logic
            product = create_product(
                vendor=request.user.vendor,  # Force vendor from auth user
                **serializer.validated_data
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            ProductDetailSerializer(product).data,
            status=status.HTTP_201_CREATED
        )


class VendorProductUpdateAPIView(APIView):
    """Vendor updates their own product."""
    permission_classes = [IsAuthenticated, IsVendor, IsVendorOwner]
    
    def patch(self, request, product_id):
        # Permission class checks product.vendor == request.user.vendor
        
        serializer = ProductUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        try:
            product = update_product(
                product_id=product_id,
                **serializer.validated_data
            )
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(ProductDetailSerializer(product).data)
```

**Key View Principles:**

1. **Delegate to services/selectors** - no business logic in views
2. **Use `@extend_schema`** for automatic API documentation
3. **Handle exceptions explicitly** - don't let them bubble up as 500s
4. **Return proper status codes** (201 for created, 404 for not found, etc.)
5. **Validate with serializers** before calling services
6. **Use permission classes** for authorization (not if statements)

**❌ DON'T:**

```python
# ❌ BAD: Business logic in view
def create_product(request):
    product = Product.objects.create(...)  # Should be in service
    for variant_data in request.data['variants']:
        variant = ProductVariant.objects.create(...)  # Complex logic here
        stock = Stock.objects.create(...)
    return Response(...)

# ❌ BAD: Not handling exceptions
def get_product(request, slug):
    product = get_product_detail(slug=slug)  # Will raise 500 if not found
    return Response(...)

# ❌ BAD: Manual permission checks
def update_product(request, product_id):
    if not request.user.role == 'vendor':  # Use permission classes!
        return Response({'error': 'Forbidden'}, status=403)
```

---

## Serializers

Serializers handle **data transformation** between models and JSON.

### Serializer Conventions

**✅ DO:**

```python
# apps/products/serializers.py
from rest_framework import serializers
from apps.products.models import Product, ProductVariant
from apps.images.serializers import ProductImageSerializer


class ProductVariantListSerializer(serializers.Serializer):
    """
    Lightweight serializer for variant listing.
    Uses Serializer instead of ModelSerializer for control.
    """
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField()
    sku = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit = serializers.CharField()
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Nested from prefetched stock
    stock_available = serializers.IntegerField(source='stock.available_quantity')
    is_in_stock = serializers.SerializerMethodField()
    
    def get_is_in_stock(self, obj):
        return obj.stock.available_quantity > 0


class ProductListSerializer(serializers.Serializer):
    """
    Optimized for product listing pages.
    Only includes essential fields.
    """
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField()
    slug = serializers.SlugField()
    
    # Nested vendor data (from select_related)
    vendor_name = serializers.CharField(source='vendor.business_name')
    
    # Display image (from prefetched images)
display_image = serializers.SerializerMethodField()
# Price range (from annotated min_variant_price)
starting_price = serializers.DecimalField(
    source='min_variant_price',
    max_digits=10,
    decimal_places=2
)

# Reviews (from annotations)
avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
review_count = serializers.IntegerField()

def get_display_image(self, obj):
    # Access prefetched images
    images = obj.productimage_set.all()
    if images:
        return images[0].image_url
    return None
class ProductDetailSerializer(serializers.Serializer):
"""
Complete product details for product page.
Includes all variants, images, reviews.
"""
id = serializers.UUIDField(read_only=True)
name = serializers.CharField()
slug = serializers.SlugField()
description = serializers.CharField()
# Vendor info
vendor = serializers.SerializerMethodField()

# All variants
variants = ProductVariantListSerializer(
    source='productvariants_set',
    many=True
)

# All images
images = ProductImageSerializer(
    source='productimage_set',
    many=True
)

# Categories
categories = serializers.SerializerMethodField()

# Meta
created_at = serializers.DateTimeField(read_only=True)

def get_vendor(self, obj):
    return {
        'id': str(obj.vendor.id),
        'business_name': obj.vendor.business_name,
    }

def get_categories(self, obj):
    return [
        {'id': str(cat.id), 'name': cat.name, 'slug': cat.slug}
        for cat in obj.category.all()
    ]
class ProductCreateSerializer(serializers.Serializer):
"""
Input serializer for product creation.
Validates data before passing to service.
"""
name = serializers.CharField(max_length=255)
description = serializers.CharField()
category_ids = serializers.ListField(
child=serializers.UUIDField(),
min_length=1
)
attributes = serializers.JSONField(required=False, default=dict)
tags = serializers.ListField(
child=serializers.CharField(),
required=False,
default=list
)
# Variants (nested creation)
variants = serializers.ListField(
    child=serializers.DictField(),
    min_length=1
)

def validate_variants(self, value):
    """Validate variant structure."""
    for variant in value:
        required_fields = ['name', 'sku', 'price', 'mrp', 'unit', 'unit_value']
        for field in required_fields:
            if field not in variant:
                raise serializers.ValidationError(
                    f"Variant missing required field: {field}"
                )
    return value

def validate_category_ids(self, value):
    """Ensure categories exist."""
    from apps.categories.models import Category
    
    existing = Category.objects.filter(id__in=value).count()
    if existing != len(value):
        raise serializers.ValidationError("Some categories do not exist")
    
    return value

**Key Serializer Principles:**

1. **Use `Serializer` over `ModelSerializer`** for read operations (more control)
2. **Use `ModelSerializer` only for simple CRUD** or admin panels
3. **Separate input/output serializers** (CreateSerializer vs DetailSerializer)
4. **Leverage prefetched data** with `source=` to avoid additional queries
5. **Use `SerializerMethodField` sparingly** (adds overhead)
6. **Validate business rules** in `validate_*` methods
7. **Keep serializers flat** - avoid deep nesting (max 2 levels)

---

## Error Handling

### Custom Exceptions
```python
# core/exceptions.py
from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientStockError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Insufficient stock available'
    default_code = 'insufficient_stock'


class InvalidCouponError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid or expired coupon'
    default_code = 'invalid_coupon'


class VendorNotApprovedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Vendor account not approved yet'
    default_code = 'vendor_not_approved'


class PaymentFailedError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Payment processing failed'
    default_code = 'payment_failed'
```

### Global Exception Handler
```python
# core/middleware/exception_handler.py
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses.
    """
    # Call DRF's default handler first
    response = drf_exception_handler(exc, context)
    
    if response is not None:
        # Standardize error format
        error_data = {
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc),
                'details': response.data if isinstance(response.data, dict) else {}
            }
        }
        response.data = error_data
    else:
        # Handle Django ValidationError
        if isinstance(exc, ValidationError):
            response = Response(
                {
                    'error': {
                        'code': 'validation_error',
                        'message': 'Validation failed',
                        'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
                    }
                },
                status=400
            )
    
    # Log all exceptions
    if response is None or response.status_code >= 500:
        logger.error(
            f"Exception in {context['view'].__class__.__name__}: {exc}",
            exc_info=True,
            extra={'request': context['request']}
        )
    
    return response


# config/settings/base.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'core.middleware.exception_handler.custom_exception_handler',
}
```

---

## Testing

### Test Structure
```python
# apps/orders/tests/test_services.py
import pytest
from decimal import Decimal
from django.test import TestCase

from apps.orders.services import create_order
from apps.customers.models import Customer
from apps.products.models import Product, ProductVariant
from apps.vendors.models import Vendor
from core.exceptions import InsufficientStockError


@pytest.mark.django_db
class TestCreateOrder:
    """Test suite for order creation service."""
    
    def test_create_order_success(self):
        """Test successful order creation with valid data."""
        # Arrange
        customer = Customer.objects.create(...)
        variant = ProductVariant.objects.create(...)
        Stock.objects.create(variant=variant, quantity=100)
        
        cart_items = [
            {'variant_id': str(variant.id), 'quantity': 2}
        ]
        address = {
            'full_name': 'John Doe',
            'phone': '9876543210',
            'address': '123 Main St',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'pin_code': '400001'
        }
        
        # Act
        order = create_order(
            customer=customer,
            cart_items=cart_items,
            shipping_address=address
        )
        
        # Assert
        assert order.id is not None
        assert order.order_number.startswith('ORD-')
        assert order.total_quantity == 2
        assert order.grand_total > 0
        
        # Check order items created
        assert order.orderitem_set.count() == 1
        order_item = order.orderitem_set.first()
        assert order_item.variant == variant
        assert order_item.quantity == 2
        
        # Check inventory reserved
        variant.stock.refresh_from_db()
        assert variant.stock.reserved_quantity == 2
    
    def test_create_order_insufficient_stock(self):
        """Test order creation fails when stock is insufficient."""
        # Arrange
        variant = ProductVariant.objects.create(...)
        Stock.objects.create(variant=variant, quantity=1)  # Only 1 in stock
        
        cart_items = [
            {'variant_id': str(variant.id), 'quantity': 5}  # Request 5
        ]
        
        # Act & Assert
        with pytest.raises(InsufficientStockError):
            create_order(
                customer=customer,
                cart_items=cart_items,
                shipping_address=address
            )
    
    def test_create_order_with_coupon(self):
        """Test order creation with valid coupon code."""
        # Arrange
        coupon = Coupon.objects.create(
            code='SAVE10',
            discount_type='PERCENTAGE',
            discount_value=10,
            ...
        )
        
        # Act
        order = create_order(
            customer=customer,
            cart_items=cart_items,
            shipping_address=address,
            coupon_code='SAVE10'
        )
        
        # Assert
        assert order.coupon_code_applied == 'SAVE10'
        assert order.discount_amount > 0


# apps/products/tests/test_selectors.py
@pytest.mark.django_db
class TestProductSelectors:
    """Test selectors for product queries."""
    
    def test_get_products_for_storefront_filters(self):
        """Test product filtering works correctly."""
        # Arrange
        category = Category.objects.create(name='Seeds', slug='seeds')
        vendor = Vendor.objects.create(...)
        
        product1 = Product.objects.create(
            name='Tomato Seeds',
            vendor=vendor,
            is_active=True
        )
        product1.category.add(category)
        
        product2 = Product.objects.create(
            name='Pepper Seeds',
            vendor=vendor,
            is_active=False  # Inactive
        )
        
        # Act
        products = get_products_for_storefront(category_slug='seeds')
        
        # Assert
        assert products.count() == 1
        assert product1 in products
        assert product2 not in products
    
    def test_query_count_optimized(self):
        """Ensure selectors don't cause N+1 queries."""
        # Arrange
        for i in range(10):
            product = Product.objects.create(...)
            ProductVariant.objects.create(product=product, ...)
        
        # Act & Assert
        with self.assertNumQueries(3):  # Expect only 3 queries total
            products = list(get_products_for_storefront())
            for product in products:
                _ = product.vendor.business_name  # Should not trigger query
                _ = list(product.productvariants_set.all())  # Should not trigger query
```

**Testing Best Practices:**

1. **Test services, not views** (services contain logic)
2. **Use `pytest` over unittest** (cleaner syntax)
3. **Use fixtures** for common test data
4. **Test happy path + edge cases** (success and failures)
5. **Use `assertNumQueries`** to prevent N+1 queries
6. **Mock external services** (payment gateways, email)

---

## Performance Optimization

### Database Query Optimization
```python
# ✅ DO: Always use select_related for ForeignKey
products = Product.objects.select_related('vendor').all()

# ✅ DO: Always use prefetch_related for ManyToMany
products = Product.objects.prefetch_related('category').all()

# ✅ DO: Use Prefetch for filtered relations
from django.db.models import Prefetch

products = Product.objects.prefetch_related(
    Prefetch(
        'productvariants_set',
        queryset=ProductVariant.objects.filter(is_active=True)
    )
).all()

# ✅ DO: Use .only() to fetch specific fields
products = Product.objects.only('id', 'name', 'price').all()

# ✅ DO: Use .values() for read-only data (bypasses ORM)
products = Product.objects.values('id', 'name', 'price')

# ❌ DON'T: Iterate without prefetch (N+1 query)
for product in Product.objects.all():
    print(product.vendor.business_name)  # N+1!

# ❌ DON'T: Access relations in loops
for product in products:
    variants = product.productvariants_set.all()  # Query per iteration!
```

### Caching Strategy
```python
# apps/products/views.py
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

@method_decorator(cache_page(60 * 5), name='dispatch')  # Cache 5 min
class ProductListAPIView(APIView):
    def get(self, request):
        # This response is cached
        ...

# Manual caching with Redis
from django.core.cache import cache

def get_featured_products():
    cache_key = 'featured_products'
    products = cache.get(cache_key)
    
    if products is None:
        products = list(
            Product.objects.filter(is_featured=True).values(...)
        )
        cache.set(cache_key, products, timeout=60 * 10)  # 10 min
    
    return products
```

### Bulk Operations
```python
# ✅ DO: Bulk create for multiple objects
OrderItem.objects.bulk_create([
    OrderItem(order=order, variant=v1, quantity=2),
    OrderItem(order=order, variant=v2, quantity=1),
])

# ✅ DO: Bulk update
variants = ProductVariant.objects.filter(product=product)
for variant in variants:
    variant.price *= 1.1  # 10% increase
ProductVariant.objects.bulk_update(variants, ['price'])

# ❌ DON'T: Loop and save (slow!)
for variant in variants:
    variant.price *= 1.1
    variant.save()  # N queries!
```

---

## Security Best Practices

### Vendor Isolation Middleware
```python
# core/middleware/vendor_isolation.py
class VendorIsolationMiddleware:
    """
    Attaches vendor_id to request for RLS enforcement.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated:
            if hasattr(request.user, 'vendor'):
                request.vendor_id = request.user.vendor.id
        
        response = self.get_response(request)
        return response
```

### Custom Permissions
```python
# core/permissions.py
from rest_framework.permissions import BasePermission

class IsVendor(BasePermission):
    """Check if user is a vendor."""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'vendor') and
            request.user.vendor.is_approved
        )


class IsVendorOwner(BasePermission):
    """Check if vendor owns the resource."""
    
    def has_object_permission(self, request, view, obj):
        # Assumes obj has a 'vendor' attribute
        if not hasattr(obj, 'vendor'):
            return False
        
        return obj.vendor.id == request.vendor_id
```

---

## Summary Checklist

Before committing code, ask yourself:

**Models:**
- [ ] Using BaseModel for all models?
- [ ] Added indexes for common queries?
- [ ] Used GeneratedField for computed values?
- [ ] No business logic in models?

**Services:**
- [ ] Using `@transaction.atomic` for multi-table writes?
- [ ] Keyword-only arguments with `*,`?
- [ ] Type hints for all parameters?
- [ ] Raising custom exceptions, not returning errors?

**Selectors:**
- [ ] Using select_related/prefetch_related?
- [ ] Returning QuerySets, not lists?
- [ ] Filtering in DB, not Python?

**Views:**
- [ ] Delegating to services/selectors?
- [ ] Handling exceptions explicitly?
- [ ] Using proper HTTP status codes?
- [ ] Added API documentation?

**Tests:**
- [ ] Testing services, not views?
- [ ] Testing both success and failure cases?
- [ ] Using assertNumQueries to prevent N+1?

---

**Remember:** This isn't about being perfect. It's about being **consistent** and **maintainable**. When in doubt, ask: "Will I understand this code in 6 months?"