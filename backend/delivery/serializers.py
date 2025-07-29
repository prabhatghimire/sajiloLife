from rest_framework import serializers
from .models import DeliveryRequest, SyncLog
from users.serializers import UserSerializer


class DeliveryRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for DeliveryRequest model.
    """
    customer = UserSerializer(read_only=True)
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    partner_phone = serializers.CharField(source='partner.user.phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DeliveryRequest
        fields = [
            'id', 'customer', 'partner', 'partner_name', 'partner_phone',
            'pickup_address', 'dropoff_address', 'pickup_lat', 'pickup_lng',
            'dropoff_lat', 'dropoff_lng', 'customer_name', 'customer_phone',
            'delivery_notes', 'status', 'status_display', 'estimated_distance',
            'estimated_duration', 'actual_distance', 'actual_duration',
            'created_at', 'updated_at', 'is_synced', 'local_id'
        ]
        read_only_fields = [
            'id', 'customer', 'partner', 'partner_name', 'partner_phone',
            'status_display', 'created_at', 'updated_at', 'is_synced'
        ]


class DeliveryRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating delivery requests.
    """
    class Meta:
        model = DeliveryRequest
        fields = [
            'pickup_address', 'dropoff_address', 'pickup_lat', 'pickup_lng',
            'dropoff_lat', 'dropoff_lng', 'customer_name', 'customer_phone',
            'delivery_notes', 'local_id'
        ]
    
    def create(self, validated_data):
        # Set the customer to the current user
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class DeliveryRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating delivery requests.
    """
    class Meta:
        model = DeliveryRequest
        fields = [
            'pickup_address', 'dropoff_address', 'pickup_lat', 'pickup_lng',
            'dropoff_lat', 'dropoff_lng', 'customer_name', 'customer_phone',
            'delivery_notes'
        ]


class DeliveryRequestStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating delivery request status.
    """
    class Meta:
        model = DeliveryRequest
        fields = ['status']
    
    def validate_status(self, value):
        instance = self.instance
        if not instance.can_transition_to(value):
            raise serializers.ValidationError(
                f"Cannot transition from '{instance.status}' to '{value}'"
            )
        return value
    
    def update(self, instance, validated_data):
        new_status = validated_data.get('status')
        if instance.transition_status(new_status):
            return instance
        else:
            raise serializers.ValidationError("Invalid status transition")


class SyncLogSerializer(serializers.ModelSerializer):
    """
    Serializer for SyncLog model.
    """
    class Meta:
        model = SyncLog
        fields = [
            'id', 'request', 'sync_status', 'error_message', 'retry_count',
            'synced_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OfflineSyncSerializer(serializers.Serializer):
    """
    Serializer for offline sync operations.
    """
    local_id = serializers.CharField()
    pickup_address = serializers.CharField()
    dropoff_address = serializers.CharField()
    pickup_lat = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    pickup_lng = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    dropoff_lat = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    dropoff_lng = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    customer_name = serializers.CharField()
    customer_phone = serializers.CharField()
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(required=False)
    
    def create(self, validated_data):
        # Set the customer to the current user
        validated_data['customer'] = self.context['request'].user
        validated_data['is_synced'] = True  # Mark as synced since it's being created on server
        
        # Create the delivery request
        delivery_request = DeliveryRequest.objects.create(**validated_data)
        
        # Create a success sync log
        SyncLog.objects.create(
            request=delivery_request,
            sync_status='success'
        )
        
        return delivery_request


class DeliveryRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing delivery requests with minimal data.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    
    class Meta:
        model = DeliveryRequest
        fields = [
            'id', 'pickup_address', 'dropoff_address', 'customer_name',
            'status', 'status_display', 'partner_name', 'created_at',
            'is_synced', 'local_id'
        ]


class DeliveryStatisticsSerializer(serializers.Serializer):
    """
    Serializer for delivery statistics.
    """
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    active_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    cancelled_requests = serializers.IntegerField()
    success_rate = serializers.FloatField()
    average_delivery_time = serializers.FloatField(required=False, allow_null=True)
    total_distance = serializers.FloatField(required=False, allow_null=True) 