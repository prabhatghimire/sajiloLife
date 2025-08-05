from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

User = get_user_model()


class DeliveryPartner(models.Model):
    """
    Model for delivery partners.
    """
    VEHICLE_CHOICES = [
        ('motorcycle', 'Motorcycle'),
        ('bicycle', 'Bicycle'),
        ('car', 'Car'),
        ('van', 'Van'),
    ]
    
    # User relationship
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='delivery_partner',
        limit_choices_to={'role': 'partner'}
    )
    
    # Vehicle information
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES)
    vehicle_number = models.CharField(max_length=20, blank=True)
    vehicle_model = models.CharField(max_length=50, blank=True)
    
    # Availability and status
    is_available = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    last_active = models.DateTimeField(auto_now=True)
    
    # Location tracking
    current_lat = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-90')), MaxValueValidator(Decimal('90'))]
    )
    current_lng = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-180')), MaxValueValidator(Decimal('180'))]
    )
    
    # Performance metrics
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(Decimal('0.0')), MaxValueValidator(Decimal('5.0'))]
    )
    total_deliveries = models.IntegerField(default=0)
    successful_deliveries = models.IntegerField(default=0)
    cancelled_deliveries = models.IntegerField(default=0)
    
    # Earnings and preferences
    hourly_rate = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0.0,
        help_text='Hourly rate in local currency'
    )
    preferred_areas = models.TextField(blank=True, help_text='Comma-separated list of preferred delivery areas')
    max_distance = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=50.0,
        help_text='Maximum delivery distance in kilometers'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delivery_partners'
        ordering = ['-rating', '-total_deliveries']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_available']),
            models.Index(fields=['is_online']),
            models.Index(fields=['current_lat', 'current_lng']),
            models.Index(fields=['rating']),
            models.Index(fields=['vehicle_type']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_vehicle_type_display()}"
    
    @property
    def success_rate(self):
        """
        Calculate delivery success rate.
        """
        if self.total_deliveries == 0:
            return 0.0
        return (self.successful_deliveries / self.total_deliveries) * 100
    
    @property
    def is_busy(self):
        """
        Check if partner is currently busy with deliveries.
        """
        return self.delivery_requests.filter(
            status__in=['assigned', 'picked_up', 'in_transit']
        ).exists()
    
    def update_location(self, lat, lng):
        """
        Update partner's current location.
        """
        self.current_lat = lat
        self.current_lng = lng
        self.last_active = models.timezone.now()
        self.save()
    
    def go_online(self):
        """
        Set partner as online and available.
        """
        self.is_online = True
        self.is_available = True
        self.last_active = models.timezone.now()
        self.save()
    
    def go_offline(self):
        """
        Set partner as offline.
        """
        self.is_online = False
        self.is_available = False
        self.save()
    
    def update_rating(self, new_rating):
        """
        Update partner's rating.
        """
        if 0 <= new_rating <= 5:
            self.rating = new_rating
            self.save()
    
    def increment_deliveries(self, successful=True):
        """
        Increment delivery count.
        """
        self.total_deliveries += 1
        if successful:
            self.successful_deliveries += 1
        else:
            self.cancelled_deliveries += 1
        self.save()
    
    def get_preferred_areas_list(self):
        """
        Get list of preferred delivery areas.
        """
        if not self.preferred_areas:
            return []
        return [area.strip() for area in self.preferred_areas.split(',') if area.strip()]
    
    def is_within_range(self, lat, lng, max_distance=None):
        """
        Check if a location is within partner's delivery range.
        """
        if not self.current_lat or not self.current_lng:
            return False
        
        if max_distance is None:
            max_distance = self.max_distance
        
        # Calculate distance using Haversine formula
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lng1 = float(self.current_lat), float(self.current_lng)
        lat2, lng2 = float(lat), float(lng)
        
        # Convert to radians
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlng = lng2 - lng1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Radius of earth in kilometers
        
        distance = c * r
        return distance <= float(max_distance) 