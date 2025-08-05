import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { database } from '../../services/database';

// Async thunks for local database operations
export const loadLocalRequests = createAsyncThunk(
  'delivery/loadLocal',
  async (_, { rejectWithValue }) => {
    try {
      const requests = await database.getAllDeliveryRequests();
      return requests;
    } catch (error) {
      return rejectWithValue('Failed to load local requests');
    }
  },
);

export const saveOfflineRequest = createAsyncThunk(
  'delivery/saveOffline',
  async (requestData: any, { rejectWithValue }) => {
    try {
      const localId = `local_${Date.now()}`;
      const offlineRequest = {
        ...requestData,
        local_id: localId,
        is_synced: false,
        created_at: new Date().toISOString(),
      };

      // Save to local database
      await database.saveDeliveryRequest(offlineRequest);

      return {
        ...offlineRequest,
        id: localId,
      };
    } catch (error) {
      return rejectWithValue('Failed to save offline request');
    }
  },
);

const initialState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  syncStatus: 'idle', // idle, syncing, success, failed
  lastSync: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    clearCurrentRequest: state => {
      state.currentRequest = null;
    },
    addLocalRequest: (state, action) => {
      state.requests.unshift(action.payload);
    },
    updateLocalRequest: (state, action) => {
      const index = state.requests.findIndex(
        req =>
          req.id === action.payload.id ||
          req.local_id === action.payload.local_id,
      );
      if (index !== -1) {
        state.requests[index] = { ...state.requests[index], ...action.payload };
      }
    },
    removeRequest: (state, action) => {
      state.requests = state.requests.filter(
        req => req.id !== action.payload && req.local_id !== action.payload,
      );
    },
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Load local requests
      .addCase(loadLocalRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })

      // Save offline request
      .addCase(saveOfflineRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
        state.currentRequest = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentRequest,
  clearCurrentRequest,
  addLocalRequest,
  updateLocalRequest,
  removeRequest,
  setSyncStatus,
} = deliverySlice.actions;

export default deliverySlice.reducer;
