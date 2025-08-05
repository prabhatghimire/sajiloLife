import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { storage } from '../services/storage';

const TokenTest: React.FC = () => {
  const [tokens, setTokens] = useState<any>({});

  const checkTokens = async () => {
    try {
      const accessToken = await storage.getAccessToken();
      const refreshToken = await storage.getRefreshToken();
      const userData = await storage.getUserData();

      setTokens({
        accessToken,
        refreshToken,
        userData,
      });

      Alert.alert(
        'Token Check',
        `Access Token: ${accessToken ? 'Present' : 'None'}\nRefresh Token: ${
          refreshToken ? 'Present' : 'None'
        }\nUser Data: ${userData ? 'Present' : 'None'}`,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check tokens');
    }
  };

  const setTestTokens = async () => {
    try {
      await storage.saveAccessToken('test-access-token-123');
      await storage.saveRefreshToken('test-refresh-token-456');
      await storage.saveUserData({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      });

      Alert.alert('Success', 'Test tokens saved!');
      await checkTokens();
    } catch (error) {
      Alert.alert('Error', 'Failed to save test tokens');
    }
  };

  const clearTokens = async () => {
    try {
      await storage.clearTokens();
      await storage.removeItem('user');
      Alert.alert('Success', 'Tokens cleared!');
      await checkTokens();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear tokens');
    }
  };

  useEffect(() => {
    checkTokens();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token Persistence Test</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Tokens:</Text>
        <Text>
          Access Token: {tokens.accessToken ? '✅ Present' : '❌ None'}
        </Text>
        <Text>
          Refresh Token: {tokens.refreshToken ? '✅ Present' : '❌ None'}
        </Text>
        <Text>User Data: {tokens.userData ? '✅ Present' : '❌ None'}</Text>
      </View>

      <View style={styles.buttons}>
        <Button title="Set Test Tokens" onPress={setTestTokens} />
        <Button title="Check Tokens" onPress={checkTokens} />
        <Button title="Clear Tokens" onPress={clearTokens} />
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttons: {
    gap: 10,
  },
});

export default TokenTest;
