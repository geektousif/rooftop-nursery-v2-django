from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch 

from apps.products.models import Product, ProductVariant
from apps.products.serializers import (
    ProductSerializer,
    ProductListSerializer,
    ProductVariantSerializer,
    ProductVariantListSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products.
    
    list: Get all products (doesn't require authentication)
    retrieve: Get a single product with full details
    create: Create a new product
    update: Update a product
    partial_update: Partially update a product
    destroy: Delete a product
    search: Search products by name, description, tags
    by_category: Get products by category slug
    by_vendor: Get products by vendor
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'vendor', 'category']
    search_fields = ['name', 'description', 'tags', 'slug']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer
    
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Optimize queries with select_related and prefetch_related
        queryset = queryset.select_related('vendor', 'vendor__user').prefetch_related(
            'category',
            Prefetch(
                'productvariant_set',
                queryset=ProductVariant.objects.filter(is_active=True).prefetch_related(
                    'productimage_set'
                ).select_related('stock')
            ),
            'productreview_set'
        )
        return queryset
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search for products."""
        query = request.query_params.get('q', '')
        category_slug = request.query_params.get('category', None)
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)
        vendor_id = request.query_params.get('vendor', None)
        
        queryset = self.get_queryset().filter(is_active=True)
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(tags__icontains=query)
            )
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        
        if min_price or max_price:
            variants = ProductVariant.objects.filter(is_active=True)
            if min_price:
                variants = variants.filter(price__gte=min_price)
            if max_price:
                variants = variants.filter(price__lte=max_price)
            product_ids = variants.values_list('product_id', flat=True).distinct()
            queryset = queryset.filter(id__in=product_ids)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-category/(?P<category_slug>[^/.]+)')
    def by_category(self, request, category_slug=None):
        """Get products by category slug."""
        queryset = self.get_queryset().filter(
            category__slug=category_slug,
            is_active=True
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-vendor/(?P<vendor_id>[^/.]+)')
    def by_vendor(self, request, vendor_id=None):
        """Get products by vendor ID."""
        queryset = self.get_queryset().filter(
            vendor_id=vendor_id,
            is_active=True
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product variants.
    """
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'product', 'is_single_unit']
    search_fields = ['name', 'sku', 'product__name']
    ordering_fields = ['display_order', 'price', 'created_at']
    ordering = ['display_order']
    lookup_field = 'sku'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductVariantListSerializer
        return ProductVariantSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('product').prefetch_related(
            'productimage_set',
            'stock'
        )
        return queryset
    
    @action(detail=True, methods=['get'])
    def stock(self, request, sku=None):
        """Get stock information for this variant."""
        variant = self.get_object()
        from apps.inventory.serializers import StockSerializer
        stock = variant.stock
        if stock:
            serializer = StockSerializer(stock)
            return Response(serializer.data)
        return Response({'detail': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)