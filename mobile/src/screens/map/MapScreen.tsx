import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Title, Button, Chip } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useDelivery } from '../../hooks/useDelivery';

const MapScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [nearbyPartners, setNearbyPartners] = useState<any[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { requests } = useDelivery();

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        return granted === 'granted';
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show nearby delivery partners.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  // Track user location
  const trackMyLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your location.',
        );
        return;
      }

      setIsTracking(true);

      // Get current location
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const region: Region = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setCurrentLocation(region);

          // Animate map to current location
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
          }

          setIsTracking(false);
        },
        error => {
          console.error('Location error:', error);
          Alert.alert('Location Error', 'Failed to get your current location.');
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (error) {
      console.error('Track location error:', error);
      setIsTracking(false);
    }
  };

  // Find nearby delivery partners
  const findNearbyPartners = async () => {
    try {
      if (!currentLocation) {
        Alert.alert(
          'No Location',
          'Please track your location first to find nearby partners.',
        );
        return;
      }

      setIsLoadingPartners(true);

      // Simulate API call to find nearby partners
      // In a real app, this would call your backend API
      setTimeout(() => {
        const mockPartners = [
          {
            id: 1,
            name: 'John Driver',
            distance: '0.5 km',
            rating: 4.8,
            vehicle: 'Motorcycle',
            latitude: currentLocation.latitude + 0.001,
            longitude: currentLocation.longitude + 0.001,
          },
          {
            id: 2,
            name: 'Sarah Rider',
            distance: '1.2 km',
            rating: 4.6,
            vehicle: 'Bicycle',
            latitude: currentLocation.latitude - 0.002,
            longitude: currentLocation.longitude - 0.002,
          },
          {
            id: 3,
            name: 'Mike Courier',
            distance: '2.1 km',
            rating: 4.9,
            vehicle: 'Car',
            latitude: currentLocation.latitude + 0.003,
            longitude: currentLocation.longitude - 0.001,
          },
        ];

        setNearbyPartners(mockPartners);
        setIsLoadingPartners(false);

        // Show partners on map
        if (mapRef.current && mockPartners.length > 0) {
          mapRef.current.fitToCoordinates(
            mockPartners.map(p => ({
              latitude: p.latitude,
              longitude: p.longitude,
            })),
            { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } },
          );
        }
      }, 2000);
    } catch (error) {
      console.error('Find partners error:', error);
      setIsLoadingPartners(false);
    }
  };

  // Get delivery request markers
  const getDeliveryMarkers = () => {
    return (requests?.results || []).map((delivery: any) => ({
      id: delivery.id,
      coordinate: {
        latitude: parseFloat(delivery.pickup_lat) || 0,
        longitude: parseFloat(delivery.pickup_lng) || 0,
      },
      title: `Delivery #${delivery.id}`,
      description: `${delivery.pickup_address} → ${delivery.dropoff_address}`,
      type: 'pickup',
    }));
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 27.7172, // Kathmandu coordinates
          longitude: 85.324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Delivery request markers */}
        {getDeliveryMarkers().map((marker: any) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.type === 'pickup' ? 'green' : 'red'}
          />
        ))}

        {/* Nearby partner markers */}
        {nearbyPartners.map(partner => (
          <Marker
            key={partner.id}
            coordinate={{
              latitude: partner.latitude,
              longitude: partner.longitude,
            }}
            title={partner.name}
            description={`${partner.vehicle} • ${partner.distance} • ⭐ ${partner.rating}`}
            pinColor="orange"
          />
        ))}
      </MapView>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={trackMyLocation}
          style={styles.button}
          loading={isTracking}
          disabled={isTracking}
        >
          {isTracking ? 'Tracking...' : 'Track My Location'}
        </Button>

        <Button
          mode="outlined"
          onPress={findNearbyPartners}
          style={styles.button}
          loading={isLoadingPartners}
          disabled={isLoadingPartners || !currentLocation}
        >
          {isLoadingPartners ? 'Finding Partners...' : 'Find Nearby Partners'}
        </Button>

        {nearbyPartners.length > 0 && (
          <View style={styles.partnersList}>
            <Title style={styles.partnersTitle}>Nearby Partners</Title>
            {nearbyPartners.map(partner => (
              <Chip key={partner.id} style={styles.partnerChip} icon="account">
                {partner.name} • {partner.distance} • ⭐ {partner.rating}
              </Chip>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 4,
  },
  partnersList: {
    marginTop: 16,
  },
  partnersTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  partnerChip: {
    marginVertical: 2,
  },
});

export default MapScreen;
