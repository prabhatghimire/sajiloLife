from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model with role-based authentication.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('partner', 'Delivery Partner'),
        ('customer', 'Customer'),
    ]
    
    # Phone number validator
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    email = models.EmailField(unique=True)
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_partner(self):
        return self.role == 'partner'
    
    @property
    def is_customer(self):
        return self.role == 'customer'
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username 