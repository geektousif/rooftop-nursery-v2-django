# not needed -> TreeNode handles it all
# if needed, use the following:

# from rest_framework import serializers
# from apps.categories.models import Category


# class CategorySerializer(serializers.ModelSerializer):
#     """Serializer for Category model with tree structure support."""
    
#     children = serializers.SerializerMethodField()
#     product_count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Category
#         fields = [
#             'id',
#             'name',
#             'slug',
#             'code',
#             'is_active',
#             'image_url',
#             'parent_id',
#             'parent',
#             'children',
#             'product_count',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at']
    
#     def get_children(self, obj):
#         """Return nested children categories."""
#         children = obj.get_children()
#         if children.exists():
#             return CategorySerializer(children, many=True).data
#         return []
    
#     def get_product_count(self, obj):
#         """Return count of products in this category."""
#         return obj.products.count()


# class CategoryListSerializer(serializers.ModelSerializer):
#     """Lightweight serializer for category lists."""
    
#     class Meta:
#         model = Category
#         fields = ['id', 'name', 'slug', 'code', 'is_active', 'image_url', 'parent_id']