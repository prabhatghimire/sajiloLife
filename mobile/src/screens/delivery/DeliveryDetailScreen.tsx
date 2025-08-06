import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useGetDeliveryRequestQuery } from '../../services/apiSlice';
import {
  formatDuration,
  formatDateTime,
  formatPhoneNumber,
} from '../../utils/formatters';

const DeliveryDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { deliveryId } = route.params;

  const {
    data: delivery,
    isLoading,
    error,
    refetch,
  } = useGetDeliveryRequestQuery(deliveryId);

  // Debug logging
  console.log('DeliveryDetailScreen - deliveryId:', deliveryId);
  console.log('DeliveryDetailScreen - delivery:', delivery);
  console.log('DeliveryDetailScreen - isLoading:', isLoading);
  console.log('DeliveryDetailScreen - error:', error);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'assigned':
        return '#2196F3';
      case 'in_transit':
        return '#FF9800';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing delivery data...');
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>
          Loading delivery details...
        </Paragraph>
      </View>
    );
  }

  if (error) {
    console.log('DeliveryDetailScreen - Error details:', error);

    // Log authentication debug info when we get a 403 error
    if (error && 'status' in error && error.status === 403) {
      console.log('DeliveryDetailScreen - Auth debug info:');
    }

    // Handle different types of errors
    let errorMessage = 'Failed to load delivery details';
    let errorDetails = '';

    if (error && 'status' in error) {
      if (error.status === 403) {
        errorMessage = 'Access Denied';
        errorDetails =
          'You do not have permission to view this delivery. This could be because:\n\n• You are not the customer who created this delivery\n• You are not the assigned delivery partner\n• You need to log in with a different account';
      } else if (error.status === 404) {
        errorMessage = 'Delivery Not Found';
        errorDetails =
          'The delivery you are looking for does not exist or has been removed.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication Required';
        errorDetails = 'Please log in to view delivery details.';
      } else {
        errorDetails = `Error: ${error.status} - ${
          (error.data as any)?.detail || 'Unknown error'
        }`;
      }
    } else {
      errorDetails = 'An unexpected error occurred. Please try again.';
    }

    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>{errorMessage}</Paragraph>
        <Paragraph style={styles.errorDetails}>{errorDetails}</Paragraph>
        <Button mode="contained" onPress={handleRefresh} style={styles.button}>
          Retry
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>Delivery not found</Paragraph>
        <Paragraph style={styles.errorDetails}>
          No data received for delivery ID: {deliveryId}
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title>Delivery #{delivery.id}</Title>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(delivery.status) }}
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(delivery.status) },
              ]}
            >
              {delivery.status_display}
            </Chip>
          </View>
          <Paragraph style={styles.customerName}>
            {delivery.customer_name}
          </Paragraph>
          {delivery.customer_phone && (
            <Paragraph style={styles.phoneNumber}>
              📞 {formatPhoneNumber(delivery.customer_phone)}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Pickup Address Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📍 Pickup Address</Title>
          <Paragraph style={styles.addressText}>
            {delivery.pickup_address}
          </Paragraph>
          {delivery.pickup_lat && delivery.pickup_lng && (
            <Paragraph style={styles.coordinates}>
              Coordinates: {delivery.pickup_lat}, {delivery.pickup_lng}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Delivery Address Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🎯 Delivery Address</Title>
          <Paragraph style={styles.addressText}>
            {delivery.dropoff_address}
          </Paragraph>
          {delivery.dropoff_lat && delivery.dropoff_lng && (
            <Paragraph style={styles.coordinates}>
              Coordinates: {delivery.dropoff_lat}, {delivery.dropoff_lng}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Partner Information Card */}
      {delivery.partner && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🚚 Assigned Partner</Title>
            <Paragraph style={styles.partnerName}>
              {delivery.partner_name}
            </Paragraph>
            {delivery.partner_phone && (
              <Paragraph style={styles.phoneNumber}>
                📞 {formatPhoneNumber(delivery.partner_phone)}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Delivery Notes Card */}
      {delivery.delivery_notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>📝 Delivery Notes</Title>
            <Paragraph style={styles.notesText}>
              {delivery.delivery_notes}
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Distance and Duration Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📊 Distance & Duration</Title>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Paragraph style={styles.metricLabel}>
                Estimated Distance:
              </Paragraph>
              <Paragraph style={styles.metricValue}>
                {delivery.estimated_distance || 'Not available'}
              </Paragraph>
            </View>
            <View style={styles.metricItem}>
              <Paragraph style={styles.metricLabel}>
                Estimated Duration:
              </Paragraph>
              <Paragraph style={styles.metricValue}>
                {delivery.estimated_duration
                  ? formatDuration(delivery.estimated_duration)
                  : 'Not available'}
              </Paragraph>
            </View>
            {delivery.actual_distance && (
              <View style={styles.metricItem}>
                <Paragraph style={styles.metricLabel}>
                  Actual Distance:
                </Paragraph>
                <Paragraph style={styles.metricValue}>
                  {delivery.actual_distance}
                </Paragraph>
              </View>
            )}
            {delivery.actual_duration && (
              <View style={styles.metricItem}>
                <Paragraph style={styles.metricLabel}>
                  Actual Duration:
                </Paragraph>
                <Paragraph style={styles.metricValue}>
                  {formatDuration(delivery.actual_duration)}
                </Paragraph>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Timestamps Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>⏰ Timestamps</Title>
          <View style={styles.timestampContainer}>
            <View style={styles.timestampItem}>
              <Paragraph style={styles.timestampLabel}>Created:</Paragraph>
              <Paragraph style={styles.timestampValue}>
                {formatDateTime(delivery.created_at)}
              </Paragraph>
            </View>
            <View style={styles.timestampItem}>
              <Paragraph style={styles.timestampLabel}>Last Updated:</Paragraph>
              <Paragraph style={styles.timestampValue}>
                {formatDateTime(delivery.updated_at)}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Sync Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🔄 Sync Status</Title>
          <Chip
            mode="outlined"
            textStyle={{ color: delivery.is_synced ? '#4CAF50' : '#FF9800' }}
            style={[
              styles.syncChip,
              { borderColor: delivery.is_synced ? '#4CAF50' : '#FF9800' },
            ]}
          >
            {delivery.is_synced ? 'Synced' : 'Pending Sync'}
          </Chip>
          {delivery.local_id && (
            <Paragraph style={styles.localId}>
              Local ID: {delivery.local_id}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleRefresh}
          style={styles.button}
          icon="refresh"
        >
          Refresh
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="arrow-left"
        >
          Back
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 32,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  metricsContainer: {
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    color: '#666',
  },
  timestampContainer: {
    gap: 8,
  },
  timestampItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timestampValue: {
    fontSize: 14,
    color: '#666',
  },
  syncChip: {
    height: 32,
    alignSelf: 'flex-start',
  },
  localId: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
});

export default DeliveryDetailScreen;
