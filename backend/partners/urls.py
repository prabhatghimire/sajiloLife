from django.urls import path
from .views import (
    DeliveryPartnerListView, DeliveryPartnerDetailView,
    DeliveryPartnerStatusView, DeliveryPartnerLocationView,
    nearby_partners_view, partner_statistics_view, assign_partner_view,
    available_partners_view, go_online_view, go_offline_view
)

app_name = 'partners'

urlpatterns = [
    # Partner management
    path('', DeliveryPartnerListView.as_view(), name='partner_list'),
    path('<int:pk>/', DeliveryPartnerDetailView.as_view(), name='partner_detail'),
    path('<int:pk>/status/', DeliveryPartnerStatusView.as_view(), name='partner_status'),
    path('<int:pk>/location/', DeliveryPartnerLocationView.as_view(), name='partner_location'),
    
    # Partner operations
    path('nearby/', nearby_partners_view, name='nearby_partners'),
    path('available/', available_partners_view, name='available_partners'),
    path('statistics/', partner_statistics_view, name='partner_statistics'),
    path('statistics/<int:pk>/', partner_statistics_view, name='partner_statistics_detail'),
    path('assign/', assign_partner_view, name='assign_partner'),
    
    # Partner status
    path('go-online/', go_online_view, name='go_online'),
    path('go-offline/', go_offline_view, name='go_offline'),
] 