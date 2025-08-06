from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)


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
        # Log debugging information
        logger.info(f"Permission check for user: {request.user.id} ({request.user.email}) with role: {request.user.role}")
        logger.info(f"Object type: {type(obj).__name__}, Object ID: {getattr(obj, 'id', 'N/A')}")
        
        # Admin users can access any object
        if request.user.is_admin:
            logger.info("Access granted: User is admin")
            return True
        
        # For delivery requests, check if user is the customer who created it
        if hasattr(obj, 'customer'):
            is_owner = obj.customer == request.user
            logger.info(f"User is customer owner: {is_owner}")
            if is_owner:
                return True
        
        # Delivery partners can access delivery requests assigned to them
        if request.user.is_partner and hasattr(obj, 'partner'):
            if obj.partner and hasattr(obj.partner, 'user'):
                is_assigned_partner = obj.partner.user == request.user
                logger.info(f"User is assigned partner: {is_assigned_partner}")
                if is_assigned_partner:
                    return True
        
        # Object owners can access their own objects (fallback)
        if hasattr(obj, 'user'):
            is_owner = obj.user == request.user
            logger.info(f"User is object owner: {is_owner}")
            if is_owner:
                return True
        
        logger.warning(f"Access denied for user {request.user.id} to object {getattr(obj, 'id', 'N/A')}")
        return False 