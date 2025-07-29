from rest_framework import serializers
from .models import DeliveryPartner
from users.serializers import UserSerializer


class DeliveryPartnerSerializer(serializers.ModelSerializer):
    """
    Serializer for DeliveryPartner model.
    """
    user = UserSerializer(read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    success_rate = serializers.FloatField(read_only=True)
    is_busy = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = DeliveryPartner
        fields = [
            'id', 'user', 'vehicle_type', 'vehicle_type_display', 'vehicle_number',
            'vehicle_model', 'is_available', 'is_online', 'last_active',
            'current_lat', 'current_lng', 'rating', 'total_deliveries',
            'successful_deliveries', 'cancelled_deliveries', 'success_rate',
            'hourly_rate', 'preferred_areas', 'max_distance', 'is_busy',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'rating', 'total_deliveries', 'successful_deliveries',
            'cancelled_deliveries', 'success_rate', 'is_busy', 'created_at', 'updated_at'
        ]


class DeliveryPartnerCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating delivery partners.
    """
    class Meta:
        model = DeliveryPartner
        fields = [
            'vehicle_type', 'vehicle_number', 'vehicle_model', 'hourly_rate',
            'preferred_areas', 'max_distance'
        ]


class DeliveryPartnerUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating delivery partner information.
    """
    class Meta:
        model = DeliveryPartner
        fields = [
            'vehicle_type', 'vehicle_number', 'vehicle_model', 'hourly_rate',
            'preferred_areas', 'max_distance'
        ]


class DeliveryPartnerStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for updating partner status (online/offline, available).
    """
    class Meta:
        model = DeliveryPartner
        fields = ['is_available', 'is_online']


class DeliveryPartnerLocationSerializer(serializers.ModelSerializer):
    """
    Serializer for updating partner location.
    """
    class Meta:
        model = DeliveryPartner
        fields = ['current_lat', 'current_lng']
    
    def validate_current_lat(self, value):
        if value is not None and (value < -90 or value > 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value
    
    def validate_current_lng(self, value):
        if value is not None and (value < -180 or value > 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class DeliveryPartnerListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing delivery partners with minimal data.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    success_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = DeliveryPartner
        fields = [
            'id', 'user_name', 'vehicle_type', 'vehicle_type_display',
            'is_available', 'is_online', 'rating', 'total_deliveries',
            'success_rate', 'current_lat', 'current_lng'
        ]


class NearbyPartnersSerializer(serializers.Serializer):
    """
    Serializer for nearby partners request.
    """
    lat = serializers.DecimalField(max_digits=10, decimal_places=8)
    lng = serializers.DecimalField(max_digits=11, decimal_places=8)
    radius_km = serializers.DecimalField(max_digits=6, decimal_places=2, default=10.0, required=False)
    
    def validate_lat(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value
    
    def validate_lng(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class PartnerStatisticsSerializer(serializers.Serializer):
    """
    Serializer for partner statistics.
    """
    total_deliveries = serializers.IntegerField()
    completed_deliveries = serializers.IntegerField()
    cancelled_deliveries = serializers.IntegerField()
    failed_deliveries = serializers.IntegerField()
    success_rate = serializers.FloatField()
    average_delivery_time = serializers.FloatField()
    total_earnings = serializers.FloatField()
    current_rating = serializers.FloatField()
    is_available = serializers.BooleanField()
    is_online = serializers.BooleanField()


class PartnerAssignmentSerializer(serializers.Serializer):
    """
    Serializer for partner assignment requests.
    """
    delivery_request_id = serializers.IntegerField()
    partner_id = serializers.IntegerField(required=False)
    
    def validate_delivery_request_id(self, value):
        from delivery.models import DeliveryRequest
        try:
            DeliveryRequest.objects.get(id=value)
        except DeliveryRequest.DoesNotExist:
            raise serializers.ValidationError("Delivery request not found.")
        return value
    
    def validate_partner_id(self, value):
        if value is not None:
            try:
                DeliveryPartner.objects.get(id=value, is_available=True)
            except DeliveryPartner.DoesNotExist:
                raise serializers.ValidationError("Partner not found or not available.")
        return value 