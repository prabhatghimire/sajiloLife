import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

const DeliveryDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { deliveryId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Delivery Request #{deliveryId}</Title>
          <Paragraph>Loading delivery details...</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Pickup Address</Title>
          <Paragraph>Address details will be loaded here</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Delivery Address</Title>
          <Paragraph>Delivery address will be loaded here</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Status</Title>
          <Paragraph>Status will be displayed here</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
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
  card: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    marginVertical: 8,
  },
});

export default DeliveryDetailScreen;
