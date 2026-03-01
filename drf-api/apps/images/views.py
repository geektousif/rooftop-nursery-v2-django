import logging

from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.images.serializers import ProductImageSerializer
from core.permissions import IsOwnerOrAdmin
from integrations.imagekit.client import imagekit

from .models import ProductImage

logger = logging.getLogger(__name__)


class AuthenticateImageUploadView(APIView):
    @csrf_exempt
    def get(self, request):
        try:
            auth_params = imagekit.helper.get_authentication_parameters()
            return Response(auth_params, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductImageViewset(ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    owner_field = "variant.product.vendor.user"

    def get_queryset(self):
        if self.request.user.is_admin_user():
            return self.queryset

        return self.queryset.filter(variant__product__vendor__user=self.request.user)

    @action(methods=["PATCH"], detail=True)
    def set_primary_image(self, request, pk=None):
        try:
            image = self.queryset.get(image_provider_id=pk)
            # image = self.get_object()
            image.is_display_image = not image.is_display_image
            image.save()

            # Set all other images to false
            ProductImage.objects.filter(variant=image.variant).exclude(pk=image.pk).update(
                is_display_image=False
            )

            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to set primary image: {e}", exc_info=True)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
