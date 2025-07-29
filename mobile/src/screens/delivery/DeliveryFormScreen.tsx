import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  useTheme,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { createDeliveryRequest } from '../../store/slices/deliverySlice';
import { theme } from '../../theme';
import { useDelivery } from '../../hooks/useDelivery';
// import * as Location from 'expo-location';

const DeliveryFormScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    customerName: '',
    customerPhone: '',
    deliveryNotes: '',
  });

  const [locations, setLocations] = useState({
    pickup: null,
    dropoff: null,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('pickup'); // 'pickup' or 'dropoff'

  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isConnected } = useSelector(state => state.network);
  const appTheme = useTheme();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to use this feature.',
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCurrentLocation({ latitude, longitude });

      // Get address for current location
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.name || ''}, ${
          addr.city || ''
        }, ${addr.region || ''}`.trim();
        updateFormData('pickupAddress', fullAddress);
        setLocations(prev => ({
          ...prev,
          pickup: { latitude, longitude, address: fullAddress },
        }));
      }
    } catch (error) {
      console.log('Error getting current location:', error);
      Alert.alert(
        'Error',
        'Could not get current location. Please enter address manually.',
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMapPress = async event => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.name || ''}, ${
          addr.city || ''
        }, ${addr.region || ''}`.trim();

        if (selectedLocation === 'pickup') {
          updateFormData('pickupAddress', fullAddress);
          setLocations(prev => ({
            ...prev,
            pickup: { latitude, longitude, address: fullAddress },
          }));
        } else {
          updateFormData('dropoffAddress', fullAddress);
          setLocations(prev => ({
            ...prev,
            dropoff: { latitude, longitude, address: fullAddress },
          }));
        }
      }
    } catch (error) {
      console.log('Error getting address:', error);
    }
  };

  const { createDeliveryRequest } = useDelivery();

  const handleSubmit = async () => {
    // Validation
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      Alert.alert('Error', 'Please select pickup and dropoff locations');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      Alert.alert('Error', 'Please fill in customer name and phone number');
      return;
    }

    if (!isValidPhone(formData.customerPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const deliveryData = {
        pickup_address: formData.pickupAddress,
        dropoff_address: formData.dropoffAddress,
        pickup_lat: locations.pickup?.latitude,
        pickup_lng: locations.pickup?.longitude,
        dropoff_lat: locations.dropoff?.latitude,
        dropoff_lng: locations.dropoff?.longitude,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        delivery_notes: formData.deliveryNotes,
      };

      await createDeliveryRequest(deliveryData);

      Alert.alert(
        'Success',
        isConnected
          ? 'Delivery request created successfully!'
          : 'Delivery request saved offline and will sync when connected.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Deliveries'),
          },
        ],
      );
    } catch (error) {
      console.log('Error creating delivery request:', error);
      Alert.alert(
        'Error',
        'Failed to create delivery request. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPhone = phone => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const getMapRegion = () => {
    if (locations.pickup && locations.dropoff) {
      // Show both locations
      const latDelta =
        Math.abs(locations.pickup.latitude - locations.dropoff.latitude) * 1.5;
      const lngDelta =
        Math.abs(locations.pickup.longitude - locations.dropoff.longitude) *
        1.5;

      return {
        latitude: (locations.pickup.latitude + locations.dropoff.latitude) / 2,
        longitude:
          (locations.pickup.longitude + locations.dropoff.longitude) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      };
    } else if (locations.pickup || locations.dropoff) {
      // Show single location
      const location = locations.pickup || locations.dropoff;
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (currentLocation) {
      // Show current location
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Default region (Kathmandu)
    return {
      latitude: 27.7172,
      longitude: 85.324,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Map Section */}
        <Card style={styles.mapCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Select Locations</Title>

            {/* Location Selection Chips */}
            <View style={styles.chipContainer}>
              <Chip
                selected={selectedLocation === 'pickup'}
                onPress={() => setSelectedLocation('pickup')}
                style={styles.chip}
                icon="map-marker"
              >
                Pickup Location
              </Chip>
              <Chip
                selected={selectedLocation === 'dropoff'}
                onPress={() => setSelectedLocation('dropoff')}
                style={styles.chip}
                icon="map-marker-check"
              >
                Dropoff Location
              </Chip>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
              {isLoadingLocation ? (
                <View style={styles.mapLoading}>
                  <ActivityIndicator
                    size="large"
                    color={appTheme.colors.primary}
                  />
                  <Text>Getting current location...</Text>
                </View>
              ) : (
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={getMapRegion()}
                  onPress={handleMapPress}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {locations.pickup && (
                    <Marker
                      coordinate={{
                        latitude: locations.pickup.latitude,
                        longitude: locations.pickup.longitude,
                      }}
                      title="Pickup Location"
                      description={locations.pickup.address}
                      pinColor={theme.colors.map.pickup}
                    />
                  )}

                  {locations.dropoff && (
                    <Marker
                      coordinate={{
                        latitude: locations.dropoff.latitude,
                        longitude: locations.dropoff.longitude,
                      }}
                      title="Dropoff Location"
                      description={locations.dropoff.address}
                      pinColor={theme.colors.map.dropoff}
                    />
                  )}
                </MapView>
              )}
            </View>

            <Text style={styles.mapInstruction}>
              Tap on the map to set{' '}
              {selectedLocation === 'pickup' ? 'pickup' : 'dropoff'} location
            </Text>
          </Card.Content>
        </Card>

        {/* Form Section */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Delivery Details</Title>

            <TextInput
              label="Pickup Address"
              value={formData.pickupAddress}
              onChangeText={value => updateFormData('pickupAddress', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />

            <TextInput
              label="Dropoff Address"
              value={formData.dropoffAddress}
              onChangeText={value => updateFormData('dropoffAddress', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker-check" />}
            />

            <TextInput
              label="Customer Name"
              value={formData.customerName}
              onChangeText={value => updateFormData('customerName', value)}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Customer Phone"
              value={formData.customerPhone}
              onChangeText={value => updateFormData('customerPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Delivery Notes (Optional)"
              value={formData.deliveryNotes}
              onChangeText={value => updateFormData('deliveryNotes', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="note-text" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? 'Creating Request...' : 'Create Delivery Request'}
            </Button>

            {!isConnected && (
              <Text style={styles.offlineNote}>
                ⚠️ You're offline. Request will be saved locally and synced when
                connected.
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  mapCard: {
    margin: theme.spacing.md,
    ...theme.shadows.medium,
  },
  formCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  chip: {
    marginRight: theme.spacing.sm,
  },
  mapContainer: {
    height: 300,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  mapInstruction: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  offlineNote: {
    textAlign: 'center',
    color: theme.colors.warning,
    fontSize: 12,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
});

export default DeliveryFormScreen;
