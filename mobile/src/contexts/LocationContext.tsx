import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
// import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  formattedAddress?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface LocationContextType {
  currentLocation: LocationData | null;
  pickupLocation: LocationData | null;
  dropLocation: LocationData | null;
  mapRegion: MapRegion;
  locationPermission: boolean;
  loading: boolean;
  error: string | null;
  setPickupLocation: (location: LocationData) => void;
  setDropLocation: (location: LocationData) => void;
  getCurrentLocation: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  geocodeAddress: (address: string) => Promise<LocationData | null>;
  reverseGeocode: (
    latitude: number,
    longitude: number,
  ) => Promise<string | null>;
  clearLocations: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

interface LocationProviderProps {
  children: ReactNode;
}

// Default region (Nepal center)
const DEFAULT_REGION: MapRegion = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null,
  );
  const [pickupLocation, setPickupLocationState] =
    useState<LocationData | null>(null);
  const [dropLocation, setDropLocationState] = useState<LocationData | null>(
    null,
  );
  const [mapRegion, setMapRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setLocationPermission(hasPermission);

      if (hasPermission) {
        await getCurrentLocation();
      } else {
        setError('Location permission denied');
      }

      return hasPermission;
    } catch (err) {
      setError('Failed to request location permission');
      console.error('Permission error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const address = await reverseGeocode(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        address: address || 'Unknown address',
      };

      setCurrentLocation(locationData);

      // Update map region to current location
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (err) {
      setError('Failed to get current location');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set pickup location
  const setPickupLocation = (location: LocationData) => {
    setPickupLocationState(location);
    // Update map region to show pickup location
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  // Set drop location
  const setDropLocation = (location: LocationData) => {
    setDropLocationState(location);
  };

  // Geocode address to coordinates
  const geocodeAddress = async (
    address: string,
  ): Promise<LocationData | null> => {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        return {
          latitude,
          longitude,
          address,
        };
      }

      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<string | null> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.district,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);

        return addressParts.join(', ');
      }

      return null;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return null;
    }
  };

  // Clear all locations
  const clearLocations = () => {
    setPickupLocationState(null);
    setDropLocationState(null);
    setMapRegion(DEFAULT_REGION);
  };

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        await getCurrentLocation();
      }
    };

    checkPermission();
  }, []);

  const value: LocationContextType = {
    currentLocation,
    pickupLocation,
    dropLocation,
    mapRegion,
    locationPermission,
    loading,
    error,
    setPickupLocation,
    setDropLocation,
    getCurrentLocation,
    requestLocationPermission,
    geocodeAddress,
    reverseGeocode,
    clearLocations,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
