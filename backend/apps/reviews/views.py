from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.reviews.models import ProductReview
from apps.reviews.serializers import ProductReviewSerializer, ProductReviewListSerializer


class ProductReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product reviews.
    """
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'customer', 'rating', 'is_verified']
    search_fields = ['reviewer_name', 'comment', 'body']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductReviewListSerializer
        return ProductReviewSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('product', 'customer', 'customer__user')
        return queryset
    
    @action(detail=False, methods=['get'], url_path='by-product/(?P<product_id>[^/.]+)')
    def by_product(self, request, product_id=None):
        """Get all reviews for a specific product."""
        queryset = self.get_queryset().filter(product_id=product_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-product/(?P<product_id>[^/.]+)/stats')
    def product_review_stats(self, request, product_id=None):
        """Get review statistics for a product."""
        reviews = self.get_queryset().filter(product_id=product_id)
        total_reviews = reviews.count()
        if total_reviews == 0:
            return Response({
                'total_reviews': 0,
                'average_rating': None,
                'rating_distribution': {}
            })
        
        average_rating = sum(r.rating for r in reviews) / total_reviews
        rating_distribution = {}
        for rating in range(1, 6):
            rating_distribution[rating] = reviews.filter(rating=rating).count()
        
        return Response({
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 2),
            'rating_distribution': rating_distribution
        })