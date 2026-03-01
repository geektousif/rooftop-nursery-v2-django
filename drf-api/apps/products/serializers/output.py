from rest_framework import serializers


class ProductVariantListSerializer(serializers.Serializer):
    """
    Variant data for storefront listing.

    Each variant is displayed as a separate product.
    """

    id = serializers.UUIDField(read_only=True)
    sku = serializers.CharField()

    # Display name
    name = serializers.SerializerMethodField()
    slug = serializers.SlugField(source="product.slug")

    # Pricing
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.IntegerField()

    # Unit info
    unit = serializers.CharField()
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)

    # Image
    image_url = serializers.SerializerMethodField()

    # Stock
    in_stock = serializers.SerializerMethodField()
    available_quantity = serializers.IntegerField(source="stock.available_quantity")

    # Vendor
    vendor_name = serializers.CharField(source="product.vendor.business_name")

    # Category
    category_name = serializers.SerializerMethodField()

    # Reviews
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2, allow_null=True)
    review_count = serializers.IntegerField(default=0)

    is_active = serializers.BooleanField()

    def get_name(self, obj) -> str:
        """Full display name."""
        return f"{obj.product.name} - {obj.name}"

    def get_image_url(self, obj) -> str | None:
        """Get display image URL."""
        if hasattr(obj, "display_images") and obj.display_images:
            return obj.display_images[0].image_url
        return None

    def get_in_stock(self, obj) -> bool:
        """Check if variant is in stock."""
        return obj.stock.available_quantity > 0

    def get_category_name(self, obj) -> str | None:
        """Get primary category name."""
        categories = obj.product.category.all()
        return categories[0].name if categories else None


class SiblingVariantSerializer(serializers.Serializer):
    """
    Minimal serializer for variant selector (other colors/sizes).

    Used in: Variant detail page to show other options
    """

    id = serializers.UUIDField(read_only=True)
    sku = serializers.CharField()
    name = serializers.CharField()  # "Pink - 1 Piece"
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)

    # Variant attributes (color, size, etc.)
    variant_attributes = serializers.JSONField()

    # Display image
    image_url = serializers.SerializerMethodField()

    # Stock
    in_stock = serializers.SerializerMethodField()
    available_quantity = serializers.IntegerField(source="stock.available_quantity")

    def get_image_url(self, obj):
        if hasattr(obj, "display_images") and obj.display_images:
            return obj.display_images[0].image_url
        return None

    def get_in_stock(self, obj):
        return obj.stock.available_quantity > 0


class ProductVariantDetailSerializer(serializers.Serializer):
    """Variant detail for product detail page."""

    id = serializers.UUIDField(read_only=True)
    sku = serializers.CharField()
    name = serializers.SerializerMethodField()

    # Full product info
    product_name = serializers.CharField(source="product.name")
    description = serializers.CharField(source="display_description")

    # Pricing
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.IntegerField()

    # Physical details
    unit = serializers.CharField()
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    weight_grams = serializers.IntegerField()

    # Attributes
    variant_attributes = serializers.JSONField()
    product_attributes = serializers.JSONField(source="product.attributes")
    tags = serializers.JSONField(source="product.tags")

    # Images (from prefetch)
    images = serializers.SerializerMethodField()

    # Stock
    in_stock = serializers.SerializerMethodField()
    available_quantity = serializers.IntegerField(source="stock.available_quantity")

    # Vendor
    vendor_id = serializers.UUIDField(source="product.vendor.id")
    vendor_name = serializers.CharField(source="product.vendor.business_name")

    # Categories
    categories = serializers.SerializerMethodField()

    # Reviews
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    review_count = serializers.IntegerField()

    # sibling_variants = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.full_name

    def get_images(self, obj):
        """Get all variant images."""
        return [
            {
                "id": img.id,
                "image_url": img.image_url,
                "is_display_image": img.is_display_image,
            }
            for img in obj.images.all()
        ]

    def get_in_stock(self, obj):
        return obj.stock.available_quantity > 0

    def get_categories(self, obj):
        """Get all product categories."""
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
            }
            for cat in obj.product.category.all()
        ]

    # def get_sibling_variants(self, obj):
    #     """Get other variants of the same product."""
    #     # This should be passed from view (already queried)
    #     siblings = self.context.get("sibling_variants", [])
    #     return SiblingVariantSerializer(siblings, many=True).data
