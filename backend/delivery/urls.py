from django.urls import path
from .views import (
    DeliveryRequestListView, DeliveryRequestDetailView,
    DeliveryRequestStatusUpdateView, SyncLogListView,
    offline_sync_view, bulk_sync_view, delivery_statistics_view,
    pending_sync_requests_view, assign_partner_view
)

app_name = 'delivery'

urlpatterns = [
    # Delivery requests
    path('requests/', DeliveryRequestListView.as_view(), name='request_list'),
    path('requests/<int:pk>/', DeliveryRequestDetailView.as_view(), name='request_detail'),
    path('requests/<int:pk>/status/', DeliveryRequestStatusUpdateView.as_view(), name='request_status_update'),
    path('requests/<int:pk>/assign-partner/', assign_partner_view, name='assign_partner'),
    
    # Sync operations
    path('sync/', offline_sync_view, name='offline_sync'),
    path('sync/bulk/', bulk_sync_view, name='bulk_sync'),
    path('sync/pending/', pending_sync_requests_view, name='pending_sync'),
    
    # Sync logs
    path('requests/<int:request_id>/sync-logs/', SyncLogListView.as_view(), name='sync_logs'),
    
    # Statistics
    path('statistics/', delivery_statistics_view, name='statistics'),
] 