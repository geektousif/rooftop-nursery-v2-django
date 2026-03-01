"""
Vendor views following HackSoft Django style guide.

Thin controllers that delegate business logic to services and data retrieval to selectors.
"""

from apps.vendors.models import Vendor
from apps.vendors.selectors import (
    vendor_get_all,
    vendor_get_approved,
    vendor_get_by_id,
    vendor_get_by_user,
    vendor_get_pending_approval,
    vendor_get_platform_vendors,
    vendor_search,
)
from apps.vendors.serializers import (
    VendorCreateSerializer,
    VendorListSerializer,
    VendorSerializer,
    VendorUpdateSerializer,
)
from apps.vendors.services import (
    create_platform_vendor,
    vendor_activate,
    vendor_approve,
    vendor_create,
    vendor_delete,
    vendor_reject,
    vendor_suspend,
    vendor_update,
)
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdmin, IsAuthenticated, IsVendor
from shared.pagination import CursorPagination


class VendorListAPIView(APIView):
    """List vendors with optional filtering."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List vendors",
        responses={200: VendorListSerializer(many=True)},
    )
    def get(self, request):
        # Extract filters
        filters = {
            "is_approved": request.query_params.get("is_approved"),
            "is_active": request.query_params.get("is_active"),
            "is_platform_vendor": request.query_params.get("is_platform_vendor"),
            "search": request.query_params.get("search"),
        }

        # Remove None values and convert strings to booleans
        for key, value in filters.items():
            if value is not None:
                if value.lower() in ("true", "false"):
                    filters[key] = value.lower() == "true"

        # Call selector
        vendors = vendor_get_all(**filters)

        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(vendors, request)

        # Serialize
        serializer = VendorListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class VendorCreateAPIView(APIView):
    """Create a new vendor account."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create vendor",
        request=VendorCreateSerializer,
        responses={201: VendorSerializer},
    )
    def post(self, request):
        serializer = VendorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vendor = vendor_create(user=request.user, **serializer.validated_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(VendorSerializer(vendor).data, status=status.HTTP_201_CREATED)


class VendorDetailAPIView(APIView):
    """Get vendor details by ID."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get vendor details",
        responses={200: VendorSerializer},
    )
    def get(self, request, vendor_id):
        try:
            vendor = vendor_get_by_id(vendor_id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions - vendors can only see their own profile unless admin
        if not request.user.is_staff:
            if hasattr(request.user, "vendor") and vendor != request.user.vendor:
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        return Response(VendorSerializer(vendor).data)


class VendorUpdateAPIView(APIView):
    """Update vendor details."""

    permission_classes = [IsAuthenticated, IsVendor]

    @extend_schema(
        summary="Update vendor",
        request=VendorUpdateSerializer,
        responses={200: VendorSerializer},
    )
    def patch(self, request, vendor_id):
        serializer = VendorUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check vendor ownership
        if hasattr(request.user, "vendor") and str(request.user.vendor.id) != vendor_id:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        try:
            vendor = vendor_update(vendor_id=vendor_id, **serializer.validated_data)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VendorSerializer(vendor).data)


class VendorApproveAPIView(APIView):
    """Approve a vendor account."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Approve vendor",
        responses={200: VendorSerializer},
    )
    def post(self, request, vendor_id):
        try:
            vendor = vendor_approve(vendor_id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VendorSerializer(vendor).data)


class VendorRejectAPIView(APIView):
    """Reject a vendor account."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Reject vendor",
        responses={200: VendorSerializer},
    )
    def post(self, request, vendor_id):
        reason = request.data.get("reason")

        try:
            vendor = vendor_reject(vendor_id=vendor_id, reason=reason)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VendorSerializer(vendor).data)


class VendorSuspendAPIView(APIView):
    """Suspend a vendor account."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Suspend vendor",
        responses={200: VendorSerializer},
    )
    def post(self, request, vendor_id):
        reason = request.data.get("reason")

        try:
            vendor = vendor_suspend(vendor_id=vendor_id, reason=reason)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VendorSerializer(vendor).data)


class VendorActivateAPIView(APIView):
    """Activate a suspended vendor account."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Activate vendor",
        responses={200: VendorSerializer},
    )
    def post(self, request, vendor_id):
        try:
            vendor = vendor_activate(vendor_id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(VendorSerializer(vendor).data)


class VendorDeleteAPIView(APIView):
    """Delete a vendor account."""

    permission_classes = [IsAuthenticated, IsVendor]

    @extend_schema(
        summary="Delete vendor",
        responses={204: None},
    )
    def delete(self, request, vendor_id):
        # Check vendor ownership
        if hasattr(request.user, "vendor") and str(request.user.vendor.id) != vendor_id:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        try:
            vendor_delete(vendor_id=vendor_id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class VendorApprovedListAPIView(APIView):
    """List approved vendors."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List approved vendors",
        responses={200: VendorListSerializer(many=True)},
    )
    def get(self, request):
        is_active = request.query_params.get("is_active", "true").lower() == "true"

        vendors = vendor_get_approved(is_active=is_active)

        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(vendors, request)

        # Serialize
        serializer = VendorListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class VendorPendingApprovalListAPIView(APIView):
    """List vendors pending approval."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="List pending approval vendors",
        responses={200: VendorListSerializer(many=True)},
    )
    def get(self, request):
        limit = request.query_params.get("limit")
        if limit:
            limit = int(limit)

        vendors = vendor_get_pending_approval(limit=limit)

        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(vendors, request)

        # Serialize
        serializer = VendorListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class VendorPlatformListAPIView(APIView):
    """List platform vendors."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List platform vendors",
        responses={200: VendorListSerializer(many=True)},
    )
    def get(self, request):
        is_active = request.query_params.get("is_active", "true").lower() == "true"

        vendors = vendor_get_platform_vendors(is_active=is_active)

        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(vendors, request)

        # Serialize
        serializer = VendorListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class VendorSearchAPIView(APIView):
    """Search vendors."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Search vendors",
        responses={200: VendorListSerializer(many=True)},
    )
    def get(self, request):
        query = request.query_params.get("q")
        if not query:
            return Response({"error": "Search query required"}, status=status.HTTP_400_BAD_REQUEST)

        is_approved = request.query_params.get("is_approved")
        if is_approved is not None:
            is_approved = is_approved.lower() == "true"

        vendors = vendor_search(query=query, is_approved=is_approved)

        # Paginate
        paginator = CursorPagination()
        paginated = paginator.paginate_queryset(vendors, request)

        # Serialize
        serializer = VendorListSerializer(paginated, many=True)

        return paginator.get_paginated_response(serializer.data)


class VendorProfileAPIView(APIView):
    """Get current user's vendor profile."""

    permission_classes = [IsAuthenticated, IsVendor]

    @extend_schema(
        summary="Get my vendor profile",
        responses={200: VendorSerializer},
    )
    def get(self, request):
        try:
            vendor = vendor_get_by_user(user_id=request.user.id)
        except Vendor.DoesNotExist:
            return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VendorSerializer(vendor).data)


class VendorCreatePlatformAPIView(APIView):
    """Create platform vendor account (admin only)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Create platform vendor",
        request=VendorCreateSerializer,
        responses={201: VendorSerializer},
    )
    def post(self, request):
        serializer = VendorCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vendor = create_platform_vendor(admin_user=request.user, **serializer.validated_data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(VendorSerializer(vendor).data, status=status.HTTP_201_CREATED)
