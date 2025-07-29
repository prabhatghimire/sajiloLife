from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import DeliveryRequest, SyncLog
from .serializers import (
    DeliveryRequestSerializer, DeliveryRequestCreateSerializer,
    DeliveryRequestUpdateSerializer, DeliveryRequestStatusUpdateSerializer,
    DeliveryRequestListSerializer, SyncLogSerializer, OfflineSyncSerializer,
    DeliveryStatisticsSerializer
)
from users.permissions import IsOwnerOrPartnerOrAdmin, IsCustomerOrAdmin
from partners.services import assign_delivery_partner


class DeliveryRequestListView(generics.ListCreateAPIView):
    """
    List and create delivery requests.
    """
    serializer_class = DeliveryRequestListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'is_synced']
    search_fields = ['pickup_address', 'dropoff_address', 'customer_name']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Return all delivery requests for all users
        return DeliveryRequest.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DeliveryRequestCreateSerializer
        return DeliveryRequestListSerializer
    
    def perform_create(self, serializer):
        delivery_request = serializer.save()
        
        # Try to assign a partner automatically
        assign_delivery_partner(delivery_request)


class DeliveryRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a delivery request.
    """
    serializer_class = DeliveryRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrPartnerOrAdmin]
    
    def get_queryset(self):
        # Return all delivery requests for all users
        return DeliveryRequest.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DeliveryRequestUpdateSerializer
        return DeliveryRequestSerializer


class DeliveryRequestStatusUpdateView(generics.UpdateAPIView):
    """
    Update delivery request status.
    """
    serializer_class = DeliveryRequestStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrPartnerOrAdmin]
    
    def get_queryset(self):
        # Return all delivery requests for all users
        return DeliveryRequest.objects.all()


class SyncLogListView(generics.ListAPIView):
    """
    List sync logs for a delivery request.
    """
    serializer_class = SyncLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrPartnerOrAdmin]
    
    def get_queryset(self):
        request_id = self.kwargs.get('request_id')
        return SyncLog.objects.filter(request_id=request_id)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsCustomerOrAdmin])
def offline_sync_view(request):
    """
    Handle offline sync of delivery requests.
    """
    serializer = OfflineSyncSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    delivery_request = serializer.save()
    
    return Response({
        'message': 'Delivery request synced successfully.',
        'delivery_request': DeliveryRequestSerializer(delivery_request).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_sync_view(request):
    """
    Handle bulk sync of multiple delivery requests.
    """
    requests_data = request.data.get('requests', [])
    synced_requests = []
    failed_requests = []
    
    for request_data in requests_data:
        serializer = OfflineSyncSerializer(data=request_data, context={'request': request})
        if serializer.is_valid():
            delivery_request = serializer.save()
            synced_requests.append(DeliveryRequestSerializer(delivery_request).data)
        else:
            failed_requests.append({
                'local_id': request_data.get('local_id'),
                'errors': serializer.errors
            })
    
    return Response({
        'message': f'Synced {len(synced_requests)} requests, {len(failed_requests)} failed.',
        'synced_requests': synced_requests,
        'failed_requests': failed_requests
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def delivery_statistics_view(request):
    """
    Get delivery statistics.
    """
    user = request.user
    
    # Base queryset - show all delivery requests
    queryset = DeliveryRequest.objects.all()
    
    # Calculate statistics
    total_requests = queryset.count()
    pending_requests = queryset.filter(status='pending').count()
    active_requests = queryset.filter(status__in=['assigned', 'picked_up', 'in_transit']).count()
    completed_requests = queryset.filter(status='delivered').count()
    cancelled_requests = queryset.filter(status='cancelled').count()
    
    # Calculate success rate
    success_rate = 0
    if total_requests > 0:
        success_rate = (completed_requests / total_requests) * 100
    
    # Calculate average delivery time
    completed_deliveries = queryset.filter(status='delivered')
    average_delivery_time = None
    if completed_deliveries.exists():
        # This is a simplified calculation - in real app, you'd track actual delivery times
        average_delivery_time = 45.0  # Placeholder value
    
    # Calculate total distance
    total_distance = None
    if completed_deliveries.exists():
        total_distance = completed_deliveries.aggregate(
            total=Avg('actual_distance')
        )['total']
    
    statistics = {
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'active_requests': active_requests,
        'completed_requests': completed_requests,
        'cancelled_requests': cancelled_requests,
        'success_rate': round(success_rate, 2),
        'average_delivery_time': average_delivery_time,
        'total_distance': total_distance,
    }
    
    serializer = DeliveryStatisticsSerializer(statistics)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_sync_requests_view(request):
    """
    Get pending sync requests for the current user.
    """
    user = request.user
    
    # Show all pending sync requests for all users
    pending_requests = DeliveryRequest.objects.filter(is_synced=False)
    
    serializer = DeliveryRequestListSerializer(pending_requests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_partner_view(request, pk):
    """
    Manually assign a partner to a delivery request.
    """
    try:
        delivery_request = DeliveryRequest.objects.get(pk=pk)
    except DeliveryRequest.DoesNotExist:
        return Response(
            {'error': 'Delivery request not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    partner_id = request.data.get('partner_id')
    if not partner_id:
        return Response(
            {'error': 'Partner ID is required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from partners.models import DeliveryPartner
        partner = DeliveryPartner.objects.get(pk=partner_id, is_available=True)
    except DeliveryPartner.DoesNotExist:
        return Response(
            {'error': 'Partner not found or not available.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    delivery_request.partner = partner
    delivery_request.status = 'assigned'
    delivery_request.save()
    
    return Response({
        'message': 'Partner assigned successfully.',
        'delivery_request': DeliveryRequestSerializer(delivery_request).data
    }, status=status.HTTP_200_OK) 