import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../services/storage';

// Async thunks for local storage management
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await storage.getUserData();
      const accessToken = await storage.getAccessToken();

      if (!userData || !accessToken) {
        throw new Error('No user data or token found');
      }

      return { user: userData, accessToken };
    } catch (error) {
      console.log('Load user error:', error);
      return rejectWithValue('Failed to load user data');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    // Clear storage
    await storage.clearTokens();
    await storage.removeItem('user');
  } catch (error) {
    console.log('Logout storage error:', error);
  }
});

interface AuthState {
  user: any;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    updateUser: (state, action) => {
      if (action.payload && state.user && typeof action.payload === 'object') {
        state.user = { ...state.user, ...(action.payload as any) };
      } else {
        state.user = action.payload;
      }
    },
    setAuthState: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.isAuthenticated = !!user;
      state.isLoading = false;
      state.error = null;
    },
    clearAuthState: state => {
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Load User
      .addCase(loadUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens.access = action.payload.accessToken;
      })
      .addCase(loadUser.rejected, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.tokens = { access: null, refresh: null };
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUser, setAuthState, clearAuthState } =
  authSlice.actions;
export default authSlice.reducer;
