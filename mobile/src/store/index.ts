import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import deliveryReducer from './slices/deliverySlice';
import syncReducer from './slices/syncSlice';
import networkReducer from './slices/networkSlice';
import { apiSlice } from '../services/apiSlice';
import { persistConfig } from './persistConfig';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  delivery: deliveryReducer,
  sync: syncReducer,
  network: networkReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
