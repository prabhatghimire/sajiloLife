from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users can access any object
        if request.user.is_admin:
            return True
        
        # Object owner can access their own object
        return obj == request.user


class IsPartnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow delivery partners or admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_partner or request.user.is_admin
        )


class IsCustomerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow customers or admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_customer or request.user.is_admin
        )


class IsOwnerOrPartnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow object owners, delivery partners, or admin users.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users can access any object
        if request.user.is_admin:
            return True
        
        # Delivery partners can access delivery requests
        if request.user.is_partner and hasattr(obj, 'partner'):
            return obj.partner.user == request.user
        
        # Object owners can access their own objects
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False 