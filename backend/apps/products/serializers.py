from rest_framework import serializers

from apps.products.models import Product

# from apps.categories.serializers import CategoryListSerializer


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class ProductImageSerializer(serializers.Serializer):
    """Simple image serializer."""

    id = serializers.UUIDField(read_only=True)
    image_url = serializers.URLField()
    is_display_image = serializers.BooleanField()
    display_order = serializers.IntegerField()


class VariantListSerializer(serializers.Serializer):
    """
    Lightweight serializer for variant listing page.

    Used in: GET /api/v1/products/ (product listing)
    """

    id = serializers.UUIDField(read_only=True)
    sku = serializers.CharField()

    # Full display name
    full_name = serializers.CharField()  # "Lotus Bulb - Pink (1 piece)"

    # Product info (from select_related)
    product_name = serializers.CharField(source="product.name")
    product_slug = serializers.SlugField(source="product.slug")

    # Pricing
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.IntegerField()

    # Unit info
    unit = serializers.CharField()
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)

    # Display image (from prefetched display_images)
    image_url = serializers.SerializerMethodField()

    # Stock status
    in_stock = serializers.SerializerMethodField()
    available_quantity = serializers.IntegerField(source="stock.available_quantity")

    # Vendor info
    vendor_name = serializers.CharField(source="product.vendor.business_name")

    # Reviews (from annotations)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2, allow_null=True)
    review_count = serializers.IntegerField()

    def get_image_url(self, obj):
        # Access prefetched display_images
        if hasattr(obj, "display_images") and obj.display_images:
            return obj.display_images[0].image_url
        return None

    def get_in_stock(self, obj):
        return obj.stock.available_quantity > 0


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


class VariantDetailSerializer(serializers.Serializer):
    """
    Complete variant details for product detail page.

    Used in: GET /api/v1/products/{slug}/ or GET /api/v1/products/{slug}/?sku=XXX
    """

    id = serializers.UUIDField(read_only=True)
    sku = serializers.CharField()
    full_name = serializers.CharField()

    # Product info
    product = serializers.SerializerMethodField()

    # Pricing
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.IntegerField()

    # Unit info
    unit = serializers.CharField()
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    weight_grams = serializers.IntegerField()

    # Variant attributes
    variant_attributes = serializers.JSONField()

    # All images for this variant
    images = ProductImageSerializer(many=True)

    # Stock info
    in_stock = serializers.SerializerMethodField()
    available_quantity = serializers.IntegerField(source="stock.available_quantity")
    low_stock_threshold = serializers.IntegerField(source="stock.low_stock_threshold")

    # Reviews (from annotations)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2, allow_null=True)
    review_count = serializers.IntegerField()

    # Sibling variants (other options of same product)
    sibling_variants = serializers.SerializerMethodField()

    # Metadata
    created_at = serializers.DateTimeField(read_only=True)

    def get_product(self, obj):
        """Product-level information."""
        return {
            "id": str(obj.product.id),
            "name": obj.product.name,
            "slug": obj.product.slug,
            "description": obj.product.description,
            "attributes": obj.product.attributes,
            "tags": obj.product.tags,
            "vendor": {
                "id": str(obj.product.vendor.id),
                "business_name": obj.product.vendor.business_name,
            },
            "categories": [
                {"id": str(cat.id), "name": cat.name, "slug": cat.slug}
                for cat in obj.product.category.all()
            ],
            # "meta_title": obj.product.meta_title,
            # "meta_description": obj.product.meta_description,
        }

    def get_in_stock(self, obj):
        return obj.stock.available_quantity > 0

    def get_sibling_variants(self, obj):
        """Get other variants of the same product."""
        # This should be passed from view (already queried)
        siblings = self.context.get("sibling_variants", [])
        return SiblingVariantSerializer(siblings, many=True).data


# variant dict schema
# @dataclass
# class VariantSchema:
#     name: str = ""
#     sku: str = ""
#     price: float = 0.0
#     mrp: float = 0.0
#     cost_price: Optional[float] = None
#     weight_grams: Optional[int] = None
#     unit: str = ""
#     unit_value: float = 0.0
#     variant_attributes: Optional[dict] = {}
#     display_order: Optional[int] = 0
#     is_active: bool = True


class VariantCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    sku = serializers.CharField(max_length=255)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2)
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    weight_grams = serializers.IntegerField(required=False)
    unit = serializers.CharField(max_length=255)
    unit_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    variant_attributes = serializers.JSONField(default=dict, required=False)
    display_order = serializers.IntegerField(default=1)
    is_active = serializers.BooleanField(default=True)


class ProductCreateSerializer(serializers.Serializer):
    """
    Payload for creating a new product with variant.
    """

    name = serializers.CharField(max_length=255)
    description = serializers.CharField()
    category_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    attributes = serializers.JSONField(required=False, default=dict)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    is_active = serializers.BooleanField(default=True)
    # Variants (nested creation)
    variants = serializers.ListField(child=VariantCreateSerializer(), min_length=1)

    # def validate_variants(self, value):
    #     """Validate variant structure."""
    #     for variant in value:
    #         required_fields = ["name", "sku", "price", "mrp", "unit", "unit_value"]
    #         for field in required_fields:
    #             if field not in variant:
    #                 raise serializers.ValidationError(f"Variant missing required field: {field}")
    #     return value

    def validate_category_ids(self, value):
        """Ensure categories exist."""
        from apps.categories.models import Category

        existing = Category.objects.filter(id__in=value).count()
        if existing != len(value):
            raise serializers.ValidationError("Some categories do not exist")

        return value


class ProductUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField()
    attributes = serializers.JSONField(required=False, default=dict)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    is_active = serializers.BooleanField(default=True)
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )

    def validate_category_ids(self, value):
        """Ensure categories exist."""
        from apps.categories.models import Category

        existing = Category.objects.filter(id__in=value).count()
        if existing != len(value):
            raise serializers.ValidationError("Some categories do not exist")

        return value


class VariantUpdateSerializer(VariantCreateSerializer):
    pass
