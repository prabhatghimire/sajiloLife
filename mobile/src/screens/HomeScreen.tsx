import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Card, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../contexts';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { delivery, network } = useApp();

  const recentDeliveries = delivery.deliveryRequests.slice(0, 3);

  const handleNewDelivery = () => {
    navigation.navigate('DeliveryForm' as never);
  };

  const handleViewAllDeliveries = () => {
    navigation.navigate('Deliveries' as never);
  };

  const handleDeliveryPress = (deliveryId: string) => {
    navigation.navigate('DeliveryDetail' as never, { deliveryId } as never);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'assigned':
        return theme.colors.primary;
      case 'in_progress':
        return theme.colors.secondary;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.disabled;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.colors.primary }]}>
          Welcome to Sajilo Life
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your trusted delivery partner
        </Text>
      </View>

      {/* Network Status */}
      {!network.isOnline && (
        <Card
          style={[
            styles.networkCard,
            { backgroundColor: theme.colors.warning },
          ]}
        >
          <Card.Content>
            <Text style={styles.networkText}>
              You're offline. Requests will be saved locally.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleNewDelivery}
          >
            <IconButton
              icon="plus"
              iconColor={theme.colors.surface}
              size={32}
            />
            <Text style={[styles.actionText, { color: theme.colors.surface }]}>
              New Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={handleViewAllDeliveries}
          >
            <IconButton
              icon="format-list-bulleted"
              iconColor={theme.colors.surface}
              size={32}
            />
            <Text style={[styles.actionText, { color: theme.colors.surface }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Deliveries */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Deliveries
          </Text>
          {delivery.deliveryRequests.length > 3 && (
            <TouchableOpacity onPress={handleViewAllDeliveries}>
              <Text
                style={[styles.viewAllText, { color: theme.colors.primary }]}
              >
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {recentDeliveries.length > 0 ? (
          recentDeliveries.map(deliveryItem => (
            <Card
              key={deliveryItem.id}
              style={[
                styles.deliveryCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => handleDeliveryPress(deliveryItem.id)}
            >
              <Card.Content>
                <View style={styles.deliveryHeader}>
                  <Text
                    style={[styles.customerName, { color: theme.colors.text }]}
                  >
                    {deliveryItem.customerName}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(deliveryItem.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(deliveryItem.status)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.deliveryAddress,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  From: {deliveryItem.pickupAddress}
                </Text>
                <Text
                  style={[
                    styles.deliveryAddress,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  To: {deliveryItem.dropAddress}
                </Text>

                <View style={styles.deliveryFooter}>
                  <Text
                    style={[
                      styles.deliveryDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {new Date(deliveryItem.createdAt).toLocaleDateString()}
                  </Text>
                  {deliveryItem.estimatedPrice && (
                    <Text
                      style={[
                        styles.deliveryPrice,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Rs. {deliveryItem.estimatedPrice}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card
            style={[
              styles.emptyCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No deliveries yet
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Create your first delivery request
              </Text>
              <Button
                mode="contained"
                onPress={handleNewDelivery}
                style={styles.createButton}
              >
                Create Delivery
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Sync Status */}
      {network.getPendingSyncRequests().length > 0 && (
        <View style={styles.section}>
          <Card
            style={[styles.syncCard, { backgroundColor: theme.colors.warning }]}
          >
            <Card.Content>
              <Text style={styles.syncText}>
                {network.getPendingSyncRequests().length} requests pending sync
              </Text>
              <Button
                mode="contained"
                onPress={network.syncPendingRequests}
                style={styles.syncButton}
              >
                Sync Now
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  networkCard: {
    marginBottom: 16,
  },
  networkText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  deliveryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deliveryAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryDate: {
    fontSize: 12,
  },
  deliveryPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  syncCard: {
    marginBottom: 16,
  },
  syncText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
