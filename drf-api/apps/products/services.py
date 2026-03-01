from datetime import datetime
from typing import Optional
from uuid import UUID

from django.db import transaction
from django.utils.text import slugify

from apps.categories.models import Category
from apps.inventory.models import Stock
from apps.products.models.product import Product, ProductVariant
from apps.users.models import User
from apps.vendors.models import Vendor


class ProductService:
    @staticmethod
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
    ) -> dict:
        """
        Create a new product with variants.

        Args:
            vendor: Vendor instance
            name: Product name
            description: Product description
            category_ids: List of category UUIDs
            attributes: Product-level attributes
            tags: List of tags
            variants: List of variant dicts, each containing:
                - name: str
                - sku: str (required, unique)
                - price: Decimal (required)
                - mrp: Decimal (required)
                - stock: int (required, initial stock quantity)
                - unit: str (optional)
                - unit_value: Decimal (optional)
                - weight_grams: int (optional)
                - variant_attributes: dict (optional)
                - is_active: bool (optional, default True)
            is_active: Product active status

        Returns:
            dict with keys:
                - product: Product instance
                - variants: list[ProductVariant]
                - stocks: list[Stock]

        Raises:
            ValueError: If validation fails

        Example:
            result = ProductService.product_create(
                vendor=vendor,
                name='Lotus Bulb',
                category_ids=[cat1.id, cat2.id],
                variants=[
                    {
                        'name': 'Pink - 1pc',
                        'sku': 'LB-PINK-1',
                        'price': Decimal('99.00'),
                        'mrp': Decimal('150.00'),
                        'stock': 100,
                        'unit': 'piece',
                        'unit_value': Decimal('1')
                    }
                ]
            )
        """
        # Generate slug from name if not provided
        slug = slugify(name)
        if Product.objects.filter(slug=slug).exists():
            slug = f"{slug}-{int(datetime.timestamp(datetime.now())):x}"  #

        # Validate categories exist
        categories = Category.objects.filter(id__in=category_ids)
        if categories.count() != len(category_ids):
            raise ValueError("Some category IDs do not exist")

        if not variants:
            raise ValueError("At least one variant is required")

        skus = [v["sku"] for v in variants]
        if len(skus) != len(set(skus)):
            raise ValueError("Duplicate SKUs in variants")

        if ProductVariant.objects.filter(sku__in=skus).exists():
            raise ValueError("One or more SKUs already exist")

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
                name=variant_data.get("name", ""),
                sku=variant_data["sku"],
                price=variant_data["price"],
                mrp=variant_data["mrp"],
                weight_grams=variant_data.get("weight_grams"),
                unit=variant_data.get("unit", ""),
                unit_value=variant_data.get("unit_value"),
                variant_attributes=variant_data.get("variant_attributes", {}),
                is_active=variant_data.get("is_active", True),
                description=variant_data.get("description", ""),
            )
            variants_to_create.append(variant)
            stock = Stock(variant=variant, quantity=variant_data["stock"])
            stocks_to_create.append(stock)

        # Bulk create variants
        created_variants = ProductVariant.objects.bulk_create(variants_to_create)
        created_stocks = Stock.objects.bulk_create(stocks_to_create)

        # Refresh to get related data
        product.refresh_from_db()

        returning_objects = {
            "product": product,
            "variants": created_variants,
            "stocks": created_stocks,
        }

        return returning_objects

    @staticmethod
    @transaction.atomic
    def product_update(
        *,
        product: Product,
        user: User,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category_ids: Optional[list[UUID]] = None,
        attributes: Optional[dict] = None,
        tags: Optional[list[str]] = None,
        variants: Optional[list[dict]] = None,
        is_active: Optional[bool] = None,
    ) -> Product:
        """
        Update product and optionally its variants.

        Args:
            product: Product instance to update
            user: User performing the update (for permission check)
            name: New product name
            description: New description
            category_ids: New category IDs
            attributes: New attributes
            tags: New tags
            variants: Variant updates (see _sync_variants for structure)
            is_active: New active status

        Returns:
            Updated Product instance

        Raises:
            ValueError: If user doesn't have permission

        Example:
            ProductService.product_update(
                product=product,
                user=request.user,
                name='Updated Name',
                variants=[
                    {
                        'id': variant_id,  # Update existing
                        'price': Decimal('89.00'),
                        'stock': 50
                    },
                    {
                        # Create new (no id)
                        'sku': 'NEW-SKU',
                        'price': Decimal('99.00'),
                        'mrp': Decimal('120.00'),
                        'stock': 30
                    }
                ]
            )
        """

        ProductService._check_permission(user, product)

        # Update product fields
        if name is not None:
            product.name = name
            # Regenerate slug if name changed
            product.slug = ""  # Will trigger auto-generation

        if description is not None:
            product.description = description

        if attributes is not None:
            product.attributes = attributes

        if tags is not None:
            product.tags = tags

        if is_active is not None:
            product.is_active = is_active

        product.save()

        # Update categories
        if category_ids is not None:
            categories = Category.objects.filter(id__in=category_ids)
            product.category.set(categories)

        # Update variants
        if variants is not None:
            ProductService._sync_variants(product, variants)

        return product

    @staticmethod
    @transaction.atomic
    def product_delete(*, product: Product, user: User) -> None:
        """
        Delete product (soft delete by setting is_active=False).

        Args:
            product: Product to delete
            user: User performing the deletion

        Raises:
            ValueError: If user doesn't have permission
        """
        ProductService._check_permission(user, product)

        product.is_active = False
        product.save()

        # Also deactivate all variants
        product.variants.update(is_active=False)

    # ===============================
    # Variant Operations
    # ===============================

    @staticmethod
    @transaction.atomic
    def variant_update(*, variant: ProductVariant, user: User, **fields) -> ProductVariant:
        """
        Update a single variant.

        Args:
            variant: ProductVariant instance
            user: User performing update
            **fields: Fields to update (price, mrp, stock, etc.)

        Example:
            ProductService.variant_update(
                variant=variant,
                user=user,
                price=Decimal('89.00'),
                stock=50
            )
        """
        ProductService._check_permission(user, variant.product)

        # Extract stock if present
        stock_qty = fields.pop("stock", None)

        # Update variant fields
        allowed_fields = [
            "name",
            "sku",
            "price",
            "mrp",
            "unit",
            "unit_value",
            "weight_grams",
            "variant_attributes",
            "description",
            "is_active",
        ]

        for field, value in fields.items():
            if field in allowed_fields:
                setattr(variant, field, value)

        variant.save()

        # Update stock
        if stock_qty is not None:
            variant.stock.quantity = stock_qty
            variant.stock.save()

        return variant

    # ===============================
    # Internal Helpers
    # ===============================

    @staticmethod
    def _check_permission(user: User, product: Product) -> None:
        """
        Check if user has permission to modify product.

        Raises:
            ValueError: If user doesn't have permission
        """
        if user.is_admin_user():
            return

        if not hasattr(user, "vendor") or user.vendor != product.vendor:
            raise ValueError("Not allowed to modify this product")

    @staticmethod
    def _sync_variants(product: Product, variants_data: list[dict]) -> None:
        """
        Sync variants: update existing, create new, delete removed.

        Args:
            product: Product instance
            variants_data: List of variant dicts:
                - With 'id': update existing variant
                - Without 'id': create new variant
                - Missing from list: delete variant
        """
        existing_variants = {str(v.id): v for v in product.variants.select_related("stock").all()}

        incoming_ids = set()

        for variant_data in variants_data:
            variant_id = variant_data.get("id")

            if variant_id and str(variant_id) in existing_variants:
                # Update existing
                variant = existing_variants[str(variant_id)]
                ProductService._update_variant_fields(variant, variant_data)
                incoming_ids.add(str(variant_id))
            else:
                # Create new
                ProductService._create_variant(product, variant_data)

        # Delete removed variants
        to_delete = set(existing_variants.keys()) - incoming_ids
        if to_delete:
            product.variants.filter(id__in=to_delete).delete()

    @staticmethod
    def _create_variant(product: Product, data: dict) -> ProductVariant:
        """Create new variant with stock."""
        stock_qty = data.pop("stock")

        variant = ProductVariant.objects.create(
            product=product,
            name=data.get("name", ""),
            sku=data["sku"],
            price=data["price"],
            mrp=data["mrp"],
            unit=data.get("unit", ""),
            unit_value=data.get("unit_value"),
            weight_grams=data.get("weight_grams"),
            variant_attributes=data.get("variant_attributes", {}),
            description=data.get("description", ""),
            is_active=data.get("is_active", True),
        )

        Stock.objects.create(variant=variant, quantity=stock_qty)

        return variant

    @staticmethod
    def _update_variant_fields(variant: ProductVariant, data: dict) -> None:
        """Update variant and stock."""
        stock_qty = data.pop("stock", None)

        # Update variant fields
        for field in [
            "name",
            "sku",
            "price",
            "mrp",
            "unit",
            "unit_value",
            "weight_grams",
            "variant_attributes",
            "description",
            "is_active",
        ]:
            if field in data:
                setattr(variant, field, data[field])

        variant.save()

        # Update stock
        if stock_qty is not None:
            variant.stock.quantity = stock_qty
            variant.stock.save()
