# from rest_framework import viewsets, filters
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend

# from apps.categories.models import Category
# from apps.categories.serializers import CategorySerializer, CategoryListSerializer


# class CategoryViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing categories with tree structure support.
    
#     list: Get all categories (flat list)
#     retrieve: Get a single category with children
#     create: Create a new category
#     update: Update a category
#     partial_update: Partially update a category
#     destroy: Delete a category
#     tree: Get category tree structure
#     """
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['is_active', 'parent_id']
#     search_fields = ['name', 'slug', 'code']
#     ordering_fields = ['name', 'created_at']
#     ordering = ['name']
#     lookup_field = 'slug'
    
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return CategoryListSerializer
#         return CategorySerializer
    
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         # Prefetch related products for product_count
#         queryset = queryset.prefetch_related('products')
#         return queryset
    
#     @action(detail=False, methods=['get'])
#     def tree(self, request):
#         """Get the full category tree structure."""
#         root_categories = Category.objects.filter(parent_id__isnull=True)
#         serializer = self.get_serializer(root_categories, many=True)
#         return Response(serializer.data)
    
#     @action(detail=True, methods=['get'])
#     def products(self, request, slug=None):
#         """Get all products in this category."""
#         category = self.get_object()
#         products = category.products.filter(is_active=True)
#         from apps.products.serializers import ProductListSerializer
#         serializer = ProductListSerializer(products, many=True, context={'request': request})
#         return Response(serializer.data)