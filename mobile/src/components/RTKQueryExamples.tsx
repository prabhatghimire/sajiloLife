import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  useLoginMutation,
  useGetDeliveryRequestsQuery,
  useCreateDeliveryRequestMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateDeliveryStatusMutation,
  useGetPartnersQuery,
  useAssignPartnerMutation,
  LoginCredentials,
  CreateDeliveryRequest,
} from '../services/apiSlice';
import { handleAPIError } from '../services/errorHandler';

// Example 1: Enhanced Login with proper error handling and token storage
export const EnhancedLoginExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const credentials: LoginCredentials = { email, password };
      const result = await login(credentials).unwrap();

      // Store tokens (you might want to do this in a thunk or effect)
      console.log('Login successful:', result);
      Alert.alert('Success', 'Login successful!');

      // Navigate to main app or update auth state
      // navigation.navigate('Home');
    } catch (err) {
      const apiError = handleAPIError(err as any);
      Alert.alert('Login Failed', apiError.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>
          {handleAPIError(error as any).message}
        </Text>
      )}
    </View>
  );
};

// Example 2: Delivery Requests with real-time updates and pull-to-refresh
export const DeliveryRequestsExample: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useGetDeliveryRequestsQuery({});

  const [createRequest, { isLoading: isCreating }] =
    useCreateDeliveryRequestMutation();
  const [updateStatus] = useUpdateDeliveryStatusMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateRequest = async () => {
    try {
      const newRequest: CreateDeliveryRequest = {
        title: 'New Delivery Request',
        description: 'Sample delivery request',
        pickup_address: '123 Pickup St',
        delivery_address: '456 Delivery Ave',
      };

      await createRequest(newRequest).unwrap();
      Alert.alert('Success', 'Delivery request created!');
    } catch (err) {
      const apiError = handleAPIError(err as any);
      Alert.alert('Error', apiError.message);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      Alert.alert('Success', 'Status updated!');
    } catch (err) {
      const apiError = handleAPIError(err as any);
      Alert.alert('Error', apiError.message);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text>Loading delivery requests...</Text>
      </View>
    );
  }

  if (error) {
    const apiError = handleAPIError(error as any);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {apiError.message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Requests</Text>
      <TouchableOpacity
        style={[styles.button, isCreating && styles.buttonDisabled]}
        onPress={handleCreateRequest}
        disabled={isCreating}
      >
        <Text style={styles.buttonText}>
          {isCreating ? 'Creating...' : 'Create New Request'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text style={styles.requestTitle}>{item.title}</Text>
            <Text style={styles.requestStatus}>Status: {item.status}</Text>
            <Text style={styles.requestAddress}>
              From: {item.pickup_address}
            </Text>
            <Text style={styles.requestAddress}>
              To: {item.delivery_address}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleStatusUpdate(item.id, 'in_progress')}
              >
                <Text style={styles.smallButtonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleStatusUpdate(item.id, 'completed')}
              >
                <Text style={styles.smallButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

// Example 3: Partner Management with conditional queries
export const PartnerManagementExample: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isAuthenticated] = useState(true); // Simulate auth state

  // Conditional query - only fetch if authenticated
  const {
    data: partners,
    isLoading,
    error,
  } = useGetPartnersQuery(
    { status: selectedStatus || undefined },
    { skip: !isAuthenticated },
  );

  const [assignPartner] = useAssignPartnerMutation();

  const handleAssignPartner = async (requestId: number, partnerId: number) => {
    try {
      await assignPartner({ requestId, partnerId }).unwrap();
      Alert.alert('Success', 'Partner assigned successfully!');
    } catch (err) {
      const apiError = handleAPIError(err as any);
      Alert.alert('Error', apiError.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view partners</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading partners...</Text>
      </View>
    );
  }

  if (error) {
    const apiError = handleAPIError(error as any);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {apiError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partners</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === '' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'online' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('online')}
        >
          <Text style={styles.filterButtonText}>Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'offline' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('offline')}
        >
          <Text style={styles.filterButtonText}>Offline</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={partners}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.partnerItem}>
            <Text style={styles.partnerName}>{item.name}</Text>
            <Text style={styles.partnerEmail}>{item.email}</Text>
            <Text style={styles.partnerStatus}>Status: {item.status}</Text>
            {item.rating && (
              <Text style={styles.partnerRating}>Rating: {item.rating}/5</Text>
            )}

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => handleAssignPartner(1, item.id)} // Example request ID
            >
              <Text style={styles.smallButtonText}>Assign</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Example 4: Profile Management with optimistic updates
export const ProfileManagementExample: React.FC = () => {
  const { data: profile, isLoading, error } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      const updatedData = {
        ...profile,
        first_name: 'Updated Name',
        phone: '+1234567890',
      };

      await updateProfile(updatedData).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      const apiError = handleAPIError(err as any);
      Alert.alert('Error', apiError.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    const apiError = handleAPIError(error as any);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {apiError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {profile && (
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profile.first_name} {profile.last_name}
          </Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          {profile.phone && (
            <Text style={styles.profilePhone}>{profile.phone}</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  requestItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  requestStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  requestAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  partnerItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  partnerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  partnerStatus: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  partnerRating: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  profileInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});
