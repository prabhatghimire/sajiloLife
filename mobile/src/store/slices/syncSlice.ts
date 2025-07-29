import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { database } from '../../services/database';

// Async thunks for local database operations
export const checkSyncStatus = createAsyncThunk(
  'sync/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const unsyncedRequests = await database.getUnsyncedRequests();
      const unsyncedUpdates = await database.getUnsyncedUpdates();

      return {
        hasUnsyncedData:
          unsyncedRequests.length > 0 || unsyncedUpdates.length > 0,
        unsyncedRequests: unsyncedRequests.length,
        unsyncedUpdates: unsyncedUpdates.length,
      };
    } catch (error) {
      return rejectWithValue('Failed to check sync status');
    }
  },
);

export const clearSyncHistory = createAsyncThunk(
  'sync/clearHistory',
  async (_, { rejectWithValue }) => {
    try {
      await database.clearSyncHistory();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to clear sync history');
    }
  },
);

const initialState = {
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  syncHistory: [],
  pendingSyncCount: 0,
  autoSyncEnabled: true,
  syncInterval: 30000, // 30 seconds
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },
    setSyncError: (state, action) => {
      state.syncError = action.payload;
    },
    clearSyncError: state => {
      state.syncError = null;
    },
    addSyncHistory: (state, action) => {
      state.syncHistory.unshift({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 50 sync records
      if (state.syncHistory.length > 50) {
        state.syncHistory = state.syncHistory.slice(0, 50);
      }
    },
    setPendingSyncCount: (state, action) => {
      state.pendingSyncCount = action.payload;
    },
    toggleAutoSync: state => {
      state.autoSyncEnabled = !state.autoSyncEnabled;
    },
    setSyncInterval: (state, action) => {
      state.syncInterval = action.payload;
    },
    updateLastSyncTime: state => {
      state.lastSyncTime = new Date().toISOString();
    },
  },
  extraReducers: builder => {
    builder
      // Check sync status
      .addCase(checkSyncStatus.fulfilled, (state, action) => {
        state.pendingSyncCount =
          action.payload.unsyncedRequests + action.payload.unsyncedUpdates;
      })

      // Clear sync history
      .addCase(clearSyncHistory.fulfilled, state => {
        state.syncHistory = [];
      });
  },
});

export const {
  setSyncing,
  setSyncError,
  clearSyncError,
  addSyncHistory,
  setPendingSyncCount,
  toggleAutoSync,
  setSyncInterval,
  updateLastSyncTime,
} = syncSlice.actions;

export default syncSlice.reducer;
