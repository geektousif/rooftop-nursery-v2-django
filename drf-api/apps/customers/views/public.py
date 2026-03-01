from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.customers.selectors import AddressSelector
from apps.customers.serializers import AddressSerializer
from apps.customers.services import AddressService
from core.permissions import AnyoneCanCreate


class PublicAddressViewSet(viewsets.ModelViewSet):
    """
    Customer address management for public/storefront.

    Endpoints:
    - GET /api/v1/addresses/ - List user's addresses
    - POST /api/v1/addresses/ - Create new address
    - PUT /api/v1/addresses/{id}/ - Update address
    - DELETE /api/v1/addresses/{id}/ - Delete address
    - POST /api/v1/addresses/{id}/set-default/ - Set as default
    """

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, AnyoneCanCreate]

    def get_queryset(self):
        """Only return addresses belonging to the current user."""
        return AddressSelector.get_user_addresses(user=self.request.user)

    def perform_create(self, serializer):
        """Create address for current user."""
        AddressService.create_address(user=self.request.user, **serializer.validated_data)

    def perform_update(self, serializer):
        """Update address."""
        AddressService.update_address(address=self.get_object(), **serializer.validated_data)

    def perform_destroy(self, instance):
        """Delete address."""
        AddressService.delete_address(address=instance)

    @action(detail=True, methods=["post"])
    def set_default(self, request, pk=None):
        """
        Set this address as default.

        POST /api/v1/public/addresses/{id}/set-default/
        """
        address = self.get_object()
        AddressService.set_default_address(address=address)

        serializer = self.get_serializer(address)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def default(self, request):
        """
        Get user's default address.

        GET /api/v1/public/addresses/default/
        """
        address = AddressSelector.get_default_address(user=request.user)

        if not address:
            return Response(
                {"detail": "No default address found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(address)
        return Response(serializer.data)
