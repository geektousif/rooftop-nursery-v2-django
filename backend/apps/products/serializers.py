from rest_framework import serializers
from apps.products.models import Product, ProductVariant
# from apps.categories.serializers import CategoryListSerializer
from apps.vendors.serializers import VendorListSerializer
from apps.images.serializers import ProductImageSerializer
from apps.inventory.serializers import StockSerializer


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for ProductVariant with related data."""
    
    images = ProductImageSerializer(many=True, read_only=True)
    stock = StockSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_name',
            'product_slug',
            'name',
            'sku',
            'price',
            'mrp',
            'cost_price',
            'display_order',
            'weight_grams',
            'unit',
            'unit_value',
            'is_active',
            'is_single_unit',
            'images',
            'stock',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductVariantListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for variant lists."""
    
    display_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'name',
            'sku',
            'price',
            'mrp',
            'display_order',
            'is_active',
            'display_image',
        ]
    
    def get_display_image(self, obj):
        """Get the display image URL for this variant."""
        display_image = obj.productimage_set.filter(is_display_image=True).first()
        if display_image:
            return display_image.image_url
        # Fallback to first image
        first_image = obj.productimage_set.first()
        return first_image.image_url if first_image else None


class ProductSerializer(serializers.ModelSerializer):
    """Full serializer for Product with all related data."""
    
    # categories = CategoryListSerializer(many=True, read_only=True)
    vendor = VendorListSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    variant_count = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'attributes',
            'tags',
            'vendor',
            # 'categories',
            'is_active',
            'variants',
            'variant_count',
            'review_count',
            'average_rating',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_variant_count(self, obj):
        return obj.productvariant_set.count()
    
    def get_review_count(self, obj):
        return obj.productreview_set.count()
    
    def get_average_rating(self, obj):
        reviews = obj.productreview_set.all()
        if reviews.exists():
            return sum(r.rating for r in reviews) / reviews.count()
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists."""
    
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    # category_names = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    display_image = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'vendor_name',
            # 'category_names',
            'min_price',
            'max_price',
            'display_image',
            'is_active',
            'review_count',
            'average_rating',
            'created_at',
        ]
    
    # def get_category_names(self, obj):
    #     return [cat.name for cat in obj.category.all()]
    
    def get_min_price(self, obj):
        variants = obj.productvariant_set.filter(is_active=True)
        if variants.exists():
            return min(v.price for v in variants)
        return None
    
    def get_max_price(self, obj):
        variants = obj.productvariant_set.filter(is_active=True)
        if variants.exists():
            return max(v.price for v in variants)
        return None
    
    def get_display_image(self, obj):
        """Get display image from first active variant."""
        first_variant = obj.productvariant_set.filter(is_active=True).first()
        if first_variant:
            display_image = first_variant.productimage_set.filter(is_display_image=True).first()
            if display_image:
                return display_image.image_url
            first_image = first_variant.productimage_set.first()
            if first_image:
                return first_image.image_url
        return None
    
    def get_review_count(self, obj):
        return obj.productreview_set.count()
    
    def get_average_rating(self, obj):
        reviews = obj.productreview_set.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None