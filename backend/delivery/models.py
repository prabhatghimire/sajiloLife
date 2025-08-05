from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

User = get_user_model()


class DeliveryRequest(models.Model):
    """
    Model for delivery requests.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned to Partner'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Failed'),
    ]
    
    # Customer information
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='delivery_requests',
        limit_choices_to={'role': 'customer'}
    )
    
    # Partner information (assigned delivery partner)
    partner = models.ForeignKey(
        'partners.DeliveryPartner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_requests'
    )
    
    # Location information
    pickup_address = models.TextField()
    dropoff_address = models.TextField()
    pickup_lat = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-90')), MaxValueValidator(Decimal('90'))]
    )
    pickup_lng = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-180')), MaxValueValidator(Decimal('180'))]
    )
    dropoff_lat = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-90')), MaxValueValidator(Decimal('90'))]
    )
    dropoff_lng = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('-180')), MaxValueValidator(Decimal('180'))]
    )
    
    # Customer details
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    delivery_notes = models.TextField(blank=True)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Distance and duration
    estimated_distance = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text='Estimated distance in kilometers'
    )
    estimated_duration = models.IntegerField(
        null=True, 
        blank=True,
        help_text='Estimated duration in minutes'
    )
    actual_distance = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text='Actual distance in kilometers'
    )
    actual_duration = models.IntegerField(
        null=True, 
        blank=True,
        help_text='Actual duration in minutes'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Offline sync fields
    is_synced = models.BooleanField(default=True)
    local_id = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        db_table = 'delivery_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['partner']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_synced']),
            models.Index(fields=['local_id']),
        ]
    
    def __str__(self):
        return f"Delivery #{self.id} - {self.customer_name} ({self.status})"
    
    def can_transition_to(self, new_status):
        """
        Check if status transition is valid.
        """
        valid_transitions = {
            'pending': ['assigned', 'cancelled'],
            'assigned': ['picked_up', 'cancelled'],
            'picked_up': ['in_transit', 'cancelled'],
            'in_transit': ['delivered', 'failed'],
            'delivered': [],
            'cancelled': [],
            'failed': [],
        }
        
        return new_status in valid_transitions.get(self.status, [])
    
    def transition_status(self, new_status):
        """
        Transition to new status if valid.
        """
        if self.can_transition_to(new_status):
            self.status = new_status
            self.save()
            return True
        return False
    
    @property
    def is_completed(self):
        """
        Check if delivery is completed.
        """
        return self.status in ['delivered', 'cancelled', 'failed']
    
    @property
    def is_active(self):
        """
        Check if delivery is active (not completed).
        """
        return not self.is_completed


class SyncLog(models.Model):
    """
    Model for tracking sync operations.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('retry', 'Retry'),
    ]
    
    request = models.ForeignKey(
        DeliveryRequest,
        on_delete=models.CASCADE,
        related_name='sync_logs'
    )
    sync_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sync_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['request']),
            models.Index(fields=['sync_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Sync Log for Delivery #{self.request.id} - {self.sync_status}"
    
    def mark_success(self):
        """
        Mark sync as successful.
        """
        from django.utils import timezone
        self.sync_status = 'success'
        self.synced_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_message=''):
        """
        Mark sync as failed.
        """
        self.sync_status = 'failed'
        self.error_message = error_message
        self.retry_count += 1
        self.save()
    
    def mark_retry(self):
        """
        Mark sync for retry.
        """
        self.sync_status = 'retry'
        self.retry_count += 1
        self.save() 