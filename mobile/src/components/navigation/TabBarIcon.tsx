import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface TabBarIconProps {
  route: {
    name: string;
  };
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  route,
  focused,
  color,
  size,
}) => {
  let iconName: string;

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Deliveries':
      iconName = focused ? 'package-variant' : 'package-variant-closed';
      break;
    case 'Map':
      iconName = focused ? 'map-marker' : 'map-marker-outline';
      break;
    case 'Profile':
      iconName = focused ? 'account' : 'account-outline';
      break;
    case 'Settings':
      iconName = focused ? 'cog' : 'cog-outline';
      break;
    case 'PartnerDashboard':
      iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
      break;
    case 'PartnerDeliveries':
      iconName = focused ? 'truck-delivery' : 'truck-delivery-outline';
      break;
    case 'PartnerProfile':
      iconName = focused ? 'account-circle' : 'account-circle-outline';
      break;
    default:
      iconName = 'help-circle-outline';
  }

  return (
    <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
  );
};

export default TabBarIcon;
