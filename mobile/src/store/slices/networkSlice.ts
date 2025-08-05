import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isConnected: true,
  connectionType: 'wifi', // wifi, cellular, none
  isInternetReachable: true,
  lastConnected: null,
  lastDisconnected: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      const {isConnected, connectionType, isInternetReachable} = action.payload;
      
      if (isConnected && !state.isConnected) {
        // Just connected
        state.lastConnected = new Date().toISOString();
      } else if (!isConnected && state.isConnected) {
        // Just disconnected
        state.lastDisconnected = new Date().toISOString();
      }
      
      state.isConnected = isConnected;
      state.connectionType = connectionType || state.connectionType;
      state.isInternetReachable = isInternetReachable !== undefined 
        ? isInternetReachable 
        : state.isInternetReachable;
    },
    setConnectionType: (state, action) => {
      state.connectionType = action.payload;
    },
    setInternetReachable: (state, action) => {
      state.isInternetReachable = action.payload;
    },
    resetNetworkState: (state) => {
      state.isConnected = true;
      state.connectionType = 'wifi';
      state.isInternetReachable = true;
      state.lastConnected = null;
      state.lastDisconnected = null;
    },
  },
});

export const {
  setConnectionStatus,
  setConnectionType,
  setInternetReachable,
  resetNetworkState,
} = networkSlice.actions;

export default networkSlice.reducer; 