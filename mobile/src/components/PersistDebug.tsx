import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { usePersist } from '../hooks/usePersist';
import { RootState } from '../store';

const PersistDebug: React.FC = () => {
  const { purgeStore, flushStore, pauseStore, resumeStore, getPersistorState } =
    usePersist();
  const auth = useSelector((state: RootState) => state.auth);
  const delivery = useSelector((state: RootState) => state.delivery);

  const handlePurge = async () => {
    await purgeStore();
  };

  const handleFlush = async () => {
    await flushStore();
  };

  const persistorState = getPersistorState();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Redux Persist Debug</Title>
          <Paragraph>
            Auth State:{' '}
            {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Paragraph>
          <Paragraph>
            User:{' '}
            {auth.user
              ? `${auth.user.first_name} ${auth.user.last_name}`
              : 'None'}
          </Paragraph>
          <Paragraph>
            Delivery Requests: {delivery.requests?.length || 0}
          </Paragraph>
          <Paragraph>
            Persistor State:{' '}
            {persistorState.bootstrapped ? 'Bootstrapped' : 'Not Bootstrapped'}
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handlePurge} style={styles.button}>
          Purge Store
        </Button>
        <Button mode="outlined" onPress={handleFlush} style={styles.button}>
          Flush Store
        </Button>
        <Button mode="outlined" onPress={pauseStore} style={styles.button}>
          Pause Store
        </Button>
        <Button mode="outlined" onPress={resumeStore} style={styles.button}>
          Resume Store
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
});

export default PersistDebug;
