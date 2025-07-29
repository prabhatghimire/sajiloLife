from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import DeliveryPartner
from .serializers import (
    DeliveryPartnerSerializer, DeliveryPartnerCreateSerializer,
    DeliveryPartnerUpdateSerializer, DeliveryPartnerStatusSerializer,
    DeliveryPartnerLocationSerializer, DeliveryPartnerListSerializer,
    NearbyPartnersSerializer, PartnerStatisticsSerializer,
    PartnerAssignmentSerializer
)
from .services import get_nearby_partners, get_partner_statistics, assign_delivery_partner
from users.permissions import IsPartnerOrAdmin, IsAdminUser
from delivery.models import DeliveryRequest


class DeliveryPartnerListView(generics.ListCreateAPIView):
    """
    List and create delivery partners.
    """
    serializer_class = DeliveryPartnerListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filterset_fields = ['vehicle_type', 'is_available', 'is_online']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['rating', 'total_deliveries', 'created_at']
    ordering = ['-rating', '-total_deliveries']
    
    def get_queryset(self):
        return DeliveryPartner.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DeliveryPartnerCreateSerializer
        return DeliveryPartnerListSerializer
    
    def perform_create(self, serializer):
        # Set the user to the current user
        serializer.save(user=self.request.user)


class DeliveryPartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a delivery partner.
    """
    serializer_class = DeliveryPartnerSerializer
    permission_classes = [permissions.IsAuthenticated, IsPartnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return DeliveryPartner.objects.all()
        else:
            return DeliveryPartner.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DeliveryPartnerUpdateSerializer
        return DeliveryPartnerSerializer


class DeliveryPartnerStatusView(generics.UpdateAPIView):
    """
    Update delivery partner status (online/offline, available).
    """
    serializer_class = DeliveryPartnerStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsPartnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return DeliveryPartner.objects.all()
        else:
            return DeliveryPartner.objects.filter(user=user)
    
    def perform_update(self, serializer):
        partner = serializer.save()
        
        # Update online/offline status
        if partner.is_online:
            partner.go_online()
        else:
            partner.go_offline()


class DeliveryPartnerLocationView(generics.UpdateAPIView):
    """
    Update delivery partner location.
    """
    serializer_class = DeliveryPartnerLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsPartnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return DeliveryPartner.objects.all()
        else:
            return DeliveryPartner.objects.filter(user=user)
    
    def perform_update(self, serializer):
        partner = serializer.save()
        partner.update_location(
            serializer.validated_data['current_lat'],
            serializer.validated_data['current_lng']
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def nearby_partners_view(request):
    """
    Get nearby delivery partners.
    """
    serializer = NearbyPartnersSerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    
    lat = serializer.validated_data['lat']
    lng = serializer.validated_data['lng']
    radius_km = serializer.validated_data.get('radius_km', 10.0)
    
    nearby_partners = get_nearby_partners(lat, lng, radius_km)
    partner_serializer = DeliveryPartnerListSerializer(nearby_partners, many=True)
    
    return Response({
        'partners': partner_serializer.data,
        'count': len(nearby_partners),
        'radius_km': radius_km
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPartnerOrAdmin])
def partner_statistics_view(request, pk=None):
    """
    Get statistics for a delivery partner.
    """
    if pk is None:
        # Get current user's partner profile
        try:
            partner = DeliveryPartner.objects.get(user=request.user)
        except DeliveryPartner.DoesNotExist:
            return Response(
                {'error': 'Partner profile not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # Get specific partner (admin only)
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            partner = DeliveryPartner.objects.get(pk=pk)
        except DeliveryPartner.DoesNotExist:
            return Response(
                {'error': 'Partner not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    statistics = get_partner_statistics(partner)
    serializer = PartnerStatisticsSerializer(statistics)
    
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def assign_partner_view(request):
    """
    Manually assign a partner to a delivery request.
    """
    serializer = PartnerAssignmentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    delivery_request_id = serializer.validated_data['delivery_request_id']
    partner_id = serializer.validated_data.get('partner_id')
    
    try:
        delivery_request = DeliveryRequest.objects.get(id=delivery_request_id)
    except DeliveryRequest.DoesNotExist:
        return Response(
            {'error': 'Delivery request not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if partner_id:
        # Manual assignment
        try:
            partner = DeliveryPartner.objects.get(id=partner_id, is_available=True)
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
            'partner': DeliveryPartnerSerializer(partner).data
        }, status=status.HTTP_200_OK)
    else:
        # Automatic assignment
        assigned_partner = assign_delivery_partner(delivery_request)
        
        if assigned_partner:
            return Response({
                'message': 'Partner assigned automatically.',
                'partner': DeliveryPartnerSerializer(assigned_partner).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'No available partners found.',
                'partner': None
            }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_partners_view(request):
    """
    Get all available delivery partners.
    """
    available_partners = DeliveryPartner.objects.filter(
        is_available=True,
        is_online=True
    ).exclude(
        delivery_requests__status__in=['assigned', 'picked_up', 'in_transit']
    ).order_by('-rating', '-total_deliveries')
    
    serializer = DeliveryPartnerListSerializer(available_partners, many=True)
    
    return Response({
        'partners': serializer.data,
        'count': available_partners.count()
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPartnerOrAdmin])
def go_online_view(request):
    """
    Set partner as online and available.
    """
    try:
        partner = DeliveryPartner.objects.get(user=request.user)
    except DeliveryPartner.DoesNotExist:
        return Response(
            {'error': 'Partner profile not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    partner.go_online()
    
    return Response({
        'message': 'Partner is now online and available.',
        'partner': DeliveryPartnerSerializer(partner).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPartnerOrAdmin])
def go_offline_view(request):
    """
    Set partner as offline.
    """
    try:
        partner = DeliveryPartner.objects.get(user=request.user)
    except DeliveryPartner.DoesNotExist:
        return Response(
            {'error': 'Partner profile not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    partner.go_offline()
    
    return Response({
        'message': 'Partner is now offline.',
        'partner': DeliveryPartnerSerializer(partner).data
    }, status=status.HTTP_200_OK) 