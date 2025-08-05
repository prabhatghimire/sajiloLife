import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DeliveryFormScreen from '../screens/delivery/DeliveryFormScreen';
import DeliveryListScreen from '../screens/delivery/DeliveryListScreen';
import DeliveryDetailScreen from '../screens/delivery/DeliveryDetailScreen';
import MapScreen from '../screens/map/MapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import PartnerDashboardScreen from '../screens/partner/PartnerDashboardScreen';
import PartnerDeliveriesScreen from '../screens/partner/PartnerDeliveriesScreen';
import PartnerProfileScreen from '../screens/partner/PartnerProfileScreen';

// Import actions
import { loadUser } from '../store/slices/authSlice';

// Import components
import TabBarIcon from '../components/navigation/TabBarIcon';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
};

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Sajilo Life' }}
      />
      <Tab.Screen
        name="Deliveries"
        component={DeliveryListScreen}
        options={{ title: 'My Deliveries' }}
      />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Partner Tab Navigator
const PartnerTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            route={route}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={PartnerDashboardScreen}
        options={{ title: 'Partner Dashboard' }}
      />
      <Tab.Screen
        name="Deliveries"
        component={PartnerDeliveriesScreen}
        options={{ title: 'My Deliveries' }}
      />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen
        name="Profile"
        component={PartnerProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainStackNavigator = () => {
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {user?.role === 'partner' ? (
        // Partner routes
        <>
          <Stack.Screen
            name="PartnerTabs"
            component={PartnerTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DeliveryDetail"
            component={DeliveryDetailScreen}
            options={{ title: 'Delivery Details' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </>
      ) : (
        // Customer routes
        <>
          <Stack.Screen
            name="CustomerTabs"
            component={CustomerTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DeliveryForm"
            component={DeliveryFormScreen}
            options={{ title: 'New Delivery' }}
          />
          <Stack.Screen
            name="DeliveryDetail"
            component={DeliveryDetailScreen}
            options={{ title: 'Delivery Details' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);
  const theme = useTheme();

  useEffect(() => {
    // Load user data on app start
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
