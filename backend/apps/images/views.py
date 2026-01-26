from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django_filters.rest_framework import DjangoFilterBackend
from imagekitio import ImageKit
from rest_framework import filters, viewsets

from apps.images.models import ProductImage
from apps.images.serializers import ProductImageSerializer
from core.config import env


@csrf_exempt
@require_POST
def imagekit_auth_view(request):
    """Get authentication parameters for ImageKit."""
    try:
        imagekit = ImageKit(
            private_key=env.get("IMAGEKIT_PRIVATE_KEY"),
        )
        auth_params = imagekit.helper.get_authentication_parameters()
        return JsonResponse(
            {
                "endpoint": env.get("IMAGEKIT_URL_ENDPOINT"),
                "public_key": env.get("IMAGEKIT_PUBLIC_KEY"),
                "authParams": auth_params,
                "folder": "/products",
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product images.
    """

    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["variant", "is_display_image"]
    ordering_fields = ["display_order", "created_at"]
    ordering = ["display_order"]

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related("variant", "variant__product")
        return queryset
