# Codebase Refactoring Guide

This document outlines the refactoring patterns established to align the codebase with the HackSoft Django Style Guide and the project's style guide.

## ✅ Completed Refactoring

### 1. Core Infrastructure
- ✅ **Core Exceptions** (`core/exceptions.py`): Custom exception classes following DRF APIException pattern
- ✅ **Core Permissions** (`core/permissions.py`): Enhanced with `IsVendor`, `IsVendorOwner`, `IsCustomer`, `IsCustomerOwner`

### 2. Products App
- ✅ **Services** (`apps/products/services.py`): Refactored to follow style guide
  - Functions: `product_create`, `product_update`, `product_delete`, `variant_create`, `variant_update`, `variant_delete`
  - Keyword-only arguments with `*,`
  - Type hints (UUID, Decimal, Optional)
  - `@transaction.atomic` for multi-table writes
  - Returns model instances, not dicts
  - Raises custom exceptions
  
- ✅ **Selectors** (`apps/products/selectors.py`): Already well-structured with proper prefetching
- ✅ **Views** (`apps/products/views.py`): Updated to use new service functions

### 3. Categories App
- ✅ **Services** (`apps/categories/services.py`): Created following style guide
  - Functions: `category_create`, `category_update`, `category_delete`
- ✅ **Selectors** (`apps/categories/selectors.py`): Created with optimized queries

## 📋 Refactoring Patterns Established

### Service Functions Pattern

```python
"""
Service module docstring explaining purpose.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.db import transaction

from apps.{app}.models import Model
from core.exceptions import CustomError


@transaction.atomic
def entity_create(
    *,
    required_param: Type,
    optional_param: Optional[Type] = None,
) -> Model:
    """
    Create a new entity.
    
    Args:
        required_param: Description
        optional_param: Description
    
    Returns:
        Created Model instance
    
    Raises:
        CustomError: When something goes wrong
    """
    # Validation
    if condition:
        raise ValueError("Error message")
    
    # Create
    entity = Model.objects.create(
        field=value,
        ...
    )
    
    return entity


@transaction.atomic
def entity_update(
    *,
    entity_id: UUID,
    field: Optional[Type] = None,
) -> Model:
    """Update an existing entity."""
    try:
        entity = Model.objects.get(id=entity_id)
    except Model.DoesNotExist:
        raise CustomError()
    
    if field is not None:
        entity.field = field
    
    entity.save()
    return entity


@transaction.atomic
def entity_delete(*, entity_id: UUID) -> None:
    """Soft delete an entity."""
    try:
        entity = Model.objects.get(id=entity_id)
    except Model.DoesNotExist:
        raise CustomError()
    
    entity.is_active = False
    entity.save()
```

### Selector Functions Pattern

```python
"""
Selector module docstring.
"""
from typing import Optional
from django.db.models import QuerySet, Prefetch

from apps.{app}.models import Model


def entity_get_all(*, is_active: Optional[bool] = None) -> QuerySet[Model]:
    """
    Get all entities with optional filtering.
    
    Returns:
        QuerySet of Model objects
    """
    qs = Model.objects.all()
    
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    
    return qs


def entity_get_by_id(*, entity_id: UUID) -> Model:
    """
    Get a single entity by ID.
    
    Raises:
        Model.DoesNotExist: If not found
    """
    return Model.objects.select_related(
        'related_field'
    ).prefetch_related(
        Prefetch('many_related', queryset=Related.objects.filter(is_active=True))
    ).get(id=entity_id)
```

### View Pattern (Thin Controllers)

```python
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from apps.{app}.selectors import entity_get_all
from apps.{app}.services import entity_create
from apps.{app}.serializers import EntityCreateSerializer, EntityListSerializer
from core.permissions import IsVendor, IsVendorOwner
from core.pagination import CursorPagination


class EntityListAPIView(APIView):
    """List entities."""
    permission_classes = []  # Public or [IsAuthenticated]
    
    @extend_schema(
        summary="List entities",
        responses={200: EntityListSerializer(many=True)},
    )
    def get(self, request):
        # Extract filters
        filters = {
            'is_active': request.query_params.get('is_active'),
        }
        
        # Call selector
        entities = entity_get_all(**filters)
        
        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(entities, request)
        
        # Serialize
        serializer = EntityListSerializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class EntityCreateAPIView(APIView):
    """Create entity (vendor only)."""
    permission_classes = [IsAuthenticated, IsVendor]
    
    @extend_schema(
        summary="Create entity",
        request=EntityCreateSerializer,
        responses={201: EntityDetailSerializer},
    )
    def post(self, request):
        serializer = EntityCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            entity = entity_create(
                vendor=request.user.vendor,
                **serializer.validated_data
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            EntityDetailSerializer(entity).data,
            status=status.HTTP_201_CREATED
        )
```

## 🔄 Remaining Refactoring Tasks

### High Priority
1. **Orders App** - Core business logic
2. **Vendors App** - Vendor management
3. **Customers App** - Customer management
4. **Inventory App** - Stock management

### Medium Priority
5. **Coupons App** - Discount management
6. **Payments App** - Payment processing
7. **Checkout App** - Order creation flow

### Lower Priority
8. **Images App** - Image management
9. **Storefront App** - Public content
10. **Users App** - User management
11. **Webhooks App** - Webhook handling

## 📝 Naming Conventions

### Services
- Pattern: `<entity>_<action>`
- Examples: `product_create`, `order_cancel`, `payment_process`

### Selectors
- Pattern: `<entity>_get_<filter>`
- Examples: `product_get_all`, `order_get_by_id`, `variant_get_for_storefront`

### Views
- Pattern: `<Entity><Action>APIView`
- Examples: `ProductListAPIView`, `OrderCreateAPIView`, `VariantDetailAPIView`

## ✅ Checklist for Each App

When refactoring an app, ensure:

- [ ] **Services** (`services.py`)
  - [ ] All functions use keyword-only args (`*,`)
  - [ ] Type hints for all parameters
  - [ ] `@transaction.atomic` for multi-table writes
  - [ ] Return model instances, not dicts
  - [ ] Raise custom exceptions (from `core.exceptions`)
  - [ ] Follow naming: `<entity>_<action>`

- [ ] **Selectors** (`selectors.py`)
  - [ ] Use `select_related` for ForeignKey/OneToOne
  - [ ] Use `prefetch_related` for ManyToMany/Reverse FKs
  - [ ] Use `Prefetch()` objects for filtered relations
  - [ ] Return QuerySets, not lists
  - [ ] Filter in database, not Python
  - [ ] Follow naming: `<entity>_get_<filter>`

- [ ] **Views** (`views.py`)
  - [ ] Thin controllers - delegate to services/selectors
  - [ ] Use `@extend_schema` for API docs
  - [ ] Handle exceptions explicitly
  - [ ] Return proper HTTP status codes
  - [ ] Use permission classes, not if statements
  - [ ] Follow naming: `<Entity><Action>APIView`

- [ ] **Serializers** (`serializers.py`)
  - [ ] Separate input/output serializers
  - [ ] Use `Serializer` over `ModelSerializer` for reads
  - [ ] Leverage prefetched data with `source=`
  - [ ] Validate business rules in `validate_*` methods

- [ ] **Permissions**
  - [ ] Use appropriate permission classes from `core.permissions`
  - [ ] Set `owner_field` or `vendor_field` on views
  - [ ] Test vendor isolation

## 🚀 Quick Start for Remaining Apps

1. **Read existing code** - Understand current structure
2. **Create/update services.py** - Follow the service pattern above
3. **Create/update selectors.py** - Follow the selector pattern above
4. **Update views.py** - Make them thin controllers
5. **Update serializers.py** - Split input/output if needed
6. **Test** - Ensure functionality works

## 📚 Reference Files

- Style Guide: `plans_guides_checklists/style_guide.md`
- HackSoft Guide: `plans_guides_checklists/hacksoft_style_guide.md`
- Endpoints: `plans_guides_checklists/endpoints.md`
- Example Services: `apps/products/services.py`
- Example Selectors: `apps/products/selectors.py`
- Example Views: `apps/products/views.py`
