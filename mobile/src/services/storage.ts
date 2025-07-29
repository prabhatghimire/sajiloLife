import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async setItem(key: string, value: any) {
    try {
      const jsonValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async getItem(key: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        try {
          return JSON.parse(jsonValue);
        } catch {
          return jsonValue; // Return as string if not JSON
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]) {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, string][]) {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error('Error setting multiple items:', error);
      return false;
    }
  }

  async multiRemove(keys: string[]) {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error removing multiple items:', error);
      return false;
    }
  }

  // Token storage methods
  async saveAccessToken(token: string) {
    return this.setItem('access_token', token);
  }

  async getAccessToken() {
    return this.getItem('access_token');
  }

  async saveRefreshToken(token: string) {
    return this.setItem('refresh_token', token);
  }

  async getRefreshToken() {
    return this.getItem('refresh_token');
  }

  async clearTokens() {
    await this.removeItem('access_token');
    await this.removeItem('refresh_token');
  }

  // App-specific storage methods
  async saveUserData(userData: any) {
    return this.setItem('user_data', userData);
  }

  async getUserData() {
    return this.getItem('user_data');
  }

  async saveDeliveryRequests(requests: any) {
    return this.setItem('delivery_requests', requests);
  }

  async getDeliveryRequests() {
    return this.getItem('delivery_requests') || [];
  }

  async saveOfflineRequests(requests: any) {
    return this.setItem('offline_requests', requests);
  }

  async getOfflineRequests() {
    return this.getItem('offline_requests') || [];
  }

  async saveSyncHistory(history: any) {
    return this.setItem('sync_history', history);
  }

  async getSyncHistory() {
    return this.getItem('sync_history') || [];
  }

  async saveAppSettings(settings: any) {
    return this.setItem('app_settings', settings);
  }

  async getAppSettings() {
    return this.getItem('app_settings') || {};
  }

  async clearUserData() {
    const keysToRemove = [
      'user_data',
      'delivery_requests',
      'offline_requests',
      'sync_history',
    ];
    return this.multiRemove(keysToRemove);
  }

  async clearAllData() {
    return this.clear();
  }
}

export const storage = new StorageService();
