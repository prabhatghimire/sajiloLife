import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist configuration for different reducers
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'delivery', 'sync', 'network'], // Only persist these reducers
  blacklist: ['api'], // Don't persist API cache
  timeout: 10000, // 10 seconds timeout
  debug: __DEV__, // Enable debug in development
};

// Individual persist configs for specific reducers
export const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['auth', 'delivery', 'sync', 'network'],
};

export const deliveryPersistConfig = {
  key: 'delivery',
  storage: AsyncStorage,
  whitelist: ['requests', 'currentRequest'], // Only persist these fields
  blacklist: ['isLoading', 'error'], // Don't persist loading states
};

export const syncPersistConfig = {
  key: 'sync',
  storage: AsyncStorage,
  whitelist: ['syncHistory', 'lastSyncTime'], // Only persist these fields
  blacklist: ['isLoading', 'error'], // Don't persist loading states
};

export const networkPersistConfig = {
  key: 'network',
  storage: AsyncStorage,
  whitelist: ['isConnected', 'isOnline'], // Only persist these fields
  blacklist: ['pendingSyncRequests'], // Don't persist pending requests
};
