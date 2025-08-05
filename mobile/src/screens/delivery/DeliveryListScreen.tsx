import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useDelivery } from '../../hooks/useDelivery';
import { theme } from '../../theme';

const DeliveryListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { requests, isLoading, refreshData, error } = useDelivery();

  // Handle the API response structure - extract results array
  const deliveryRequests = requests?.results || requests || [];

  // Debug logging
  console.log('DeliveryListScreen - requests:', requests);
  console.log('DeliveryListScreen - deliveryRequests:', deliveryRequests);
  console.log('DeliveryListScreen - isLoading:', isLoading);
  console.log('DeliveryListScreen - error:', error);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'assigned':
        return '#2196f3';
      case 'in_transit':
        return '#9c27b0';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDeliveryItem = ({ item }: { item: any }) => (
    <Card
      style={styles.card}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('DeliveryDetail', { deliveryId: item.id });
      }}
    >
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>
            {item.customer_name || 'Delivery Request'}
          </Title>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[
              styles.statusChip,
              { borderColor: getStatusColor(item.status) },
            ]}
          >
            {item.status_display || getStatusText(item.status || 'pending')}
          </Chip>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From:</Text>
            <Text style={styles.detailValue}>{item.pickup_address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To:</Text>
            <Text style={styles.detailValue}>{item.dropoff_address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          {item.delivery_notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.detailValue}>{item.delivery_notes}</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Title>No Deliveries Yet</Title>
          <Paragraph>
            You haven't created any delivery requests yet. Tap the + button to
            create your first delivery request.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('DeliveryForm');
            }}
            style={styles.createButton}
          >
            Create First Delivery
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  if (isLoading && deliveryRequests.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading deliveries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading deliveries</Text>
        <Button mode="contained" onPress={refreshData}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveryRequests}
        renderItem={renderDeliveryItem}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('DeliveryForm');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 60,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCard: {
    width: '100%',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  createButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DeliveryListScreen;
