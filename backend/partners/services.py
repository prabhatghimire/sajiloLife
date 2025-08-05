from django.db.models import Q
from .models import DeliveryPartner


def assign_delivery_partner(delivery_request):
    """
    Automatically assign the best available partner to a delivery request.
    """
    # Get pickup location
    pickup_lat = delivery_request.pickup_lat
    pickup_lng = delivery_request.pickup_lng
    
    if not pickup_lat or not pickup_lng:
        # If no coordinates, assign based on other criteria
        return assign_partner_without_location(delivery_request)
    
    # Find available partners within range
    available_partners = DeliveryPartner.objects.filter(
        is_available=True,
        is_online=True
    ).exclude(
        delivery_requests__status__in=['assigned', 'picked_up', 'in_transit']
    )
    
    # Filter partners within range
    partners_in_range = []
    for partner in available_partners:
        if partner.is_within_range(pickup_lat, pickup_lng):
            partners_in_range.append(partner)
    
    if not partners_in_range:
        # If no partners in range, try to find any available partner
        return assign_partner_without_location(delivery_request)
    
    # Score partners based on multiple criteria
    scored_partners = []
    for partner in partners_in_range:
        score = calculate_partner_score(partner, delivery_request)
        scored_partners.append((partner, score))
    
    # Sort by score (highest first)
    scored_partners.sort(key=lambda x: x[1], reverse=True)
    
    if scored_partners:
        best_partner = scored_partners[0][0]
        delivery_request.partner = best_partner
        delivery_request.status = 'assigned'
        delivery_request.save()
        return best_partner
    
    return None


def assign_partner_without_location(delivery_request):
    """
    Assign partner when location data is not available.
    """
    # Find available partners who are not busy
    available_partners = DeliveryPartner.objects.filter(
        is_available=True,
        is_online=True
    ).exclude(
        delivery_requests__status__in=['assigned', 'picked_up', 'in_transit']
    ).order_by('-rating', '-total_deliveries')
    
    if available_partners.exists():
        best_partner = available_partners.first()
        delivery_request.partner = best_partner
        delivery_request.status = 'assigned'
        delivery_request.save()
        return best_partner
    
    return None


def calculate_partner_score(partner, delivery_request):
    """
    Calculate a score for partner assignment based on multiple factors.
    """
    score = 0.0
    
    # Rating factor (0-5 scale, weighted heavily)
    score += float(partner.rating) * 10
    
    # Success rate factor
    success_rate = partner.success_rate
    score += success_rate * 0.1
    
    # Experience factor (more deliveries = higher score)
    score += min(partner.total_deliveries * 0.01, 5.0)
    
    # Distance factor (closer partners get higher scores)
    if delivery_request.pickup_lat and delivery_request.pickup_lng:
        distance = calculate_distance(
            float(partner.current_lat), float(partner.current_lng),
            float(delivery_request.pickup_lat), float(delivery_request.pickup_lng)
        )
        # Inverse distance scoring (closer = higher score)
        if distance > 0:
            score += 10.0 / distance
    
    # Availability factor (partners who have been online longer get preference)
    from django.utils import timezone
    time_diff = timezone.now() - partner.last_active
    if time_diff.total_seconds() < 300:  # Within 5 minutes
        score += 2.0
    
    # Vehicle type preference (motorcycles are faster for short distances)
    if partner.vehicle_type == 'motorcycle':
        score += 1.0
    elif partner.vehicle_type == 'bicycle':
        score += 0.5
    
    return score


def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate distance between two points using Haversine formula.
    """
    from math import radians, cos, sin, asin, sqrt
    
    # Convert to radians
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    
    # Haversine formula
    dlng = lng2 - lng1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    
    return c * r


def get_nearby_partners(lat, lng, radius_km=10):
    """
    Get partners within a specified radius.
    """
    available_partners = DeliveryPartner.objects.filter(
        is_available=True,
        is_online=True
    )
    
    nearby_partners = []
    for partner in available_partners:
        if partner.is_within_range(lat, lng, radius_km):
            nearby_partners.append(partner)
    
    return nearby_partners


def update_partner_metrics(partner, delivery_successful=True):
    """
    Update partner metrics after delivery completion.
    """
    partner.increment_deliveries(successful=delivery_successful)
    
    # Update rating based on delivery outcome
    if delivery_successful:
        # Increase rating slightly for successful delivery
        new_rating = min(5.0, float(partner.rating) + 0.1)
        partner.update_rating(new_rating)
    else:
        # Decrease rating slightly for failed delivery
        new_rating = max(0.0, float(partner.rating) - 0.2)
        partner.update_rating(new_rating)


def get_partner_statistics(partner):
    """
    Get comprehensive statistics for a partner.
    """
    from delivery.models import DeliveryRequest
    
    # Get delivery requests for this partner
    deliveries = DeliveryRequest.objects.filter(partner=partner)
    
    # Calculate statistics
    total_deliveries = deliveries.count()
    completed_deliveries = deliveries.filter(status='delivered').count()
    cancelled_deliveries = deliveries.filter(status='cancelled').count()
    failed_deliveries = deliveries.filter(status='failed').count()
    
    # Calculate success rate
    success_rate = 0
    if total_deliveries > 0:
        success_rate = (completed_deliveries / total_deliveries) * 100
    
    # Calculate average delivery time (simplified)
    avg_delivery_time = 45.0  # Placeholder value
    
    # Calculate total earnings (simplified)
    total_earnings = completed_deliveries * float(partner.hourly_rate) * 0.75  # 45 minutes average
    
    return {
        'total_deliveries': total_deliveries,
        'completed_deliveries': completed_deliveries,
        'cancelled_deliveries': cancelled_deliveries,
        'failed_deliveries': failed_deliveries,
        'success_rate': round(success_rate, 2),
        'average_delivery_time': avg_delivery_time,
        'total_earnings': round(total_earnings, 2),
        'current_rating': float(partner.rating),
        'is_available': partner.is_available,
        'is_online': partner.is_online,
    } 