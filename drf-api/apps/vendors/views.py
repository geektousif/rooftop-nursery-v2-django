from rest_framework.mixins import ListModelMixin
from rest_framework.viewsets import GenericViewSet

from core.permissions import IsAdminOrReadOnly

from .models import Vendor
from .serializers import VendorListSerializer

# Create your views here.


class VendorListView(ListModelMixin, GenericViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = VendorListSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_user():
            return Vendor.objects.select_related("user").all()

        return Vendor.objects.select_related("user").filter(is_approved=True)

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return self.handle_exception(e)
