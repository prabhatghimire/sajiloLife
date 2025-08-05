import { useDispatch, useSelector } from 'react-redux';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} from '../services/apiSlice';
import { setAuthState, clearAuthState } from '../store/slices/authSlice';
import { storage } from '../services/storage';
import { handleAPIError } from '../services/errorHandler';
import { LoginCredentials, RegisterData } from '../services/apiSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      // Update Redux state (Redux Persist will handle storage)
      dispatch(
        setAuthState({
          user: result.user,
          tokens: {
            access: result.tokens.access,
            refresh: result.tokens.refresh,
          },
        }),
      );

      // Save user data to AsyncStorage
      await storage.saveUserData(result.user);

      // Also store tokens in AsyncStorage for API access
      await storage.saveAccessToken(result.tokens.access);
      await storage.saveRefreshToken(result.tokens.refresh);

      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const result = await registerMutation(userData).unwrap();

      // Update Redux state (Redux Persist will handle storage)
      dispatch(
        setAuthState({
          user: result.user,
          tokens: {
            access: result.tokens.access,
            refresh: result.tokens.refresh,
          },
        }),
      );

      // Also store tokens in AsyncStorage for API access
      await storage.saveAccessToken(result.tokens.access);
      await storage.saveRefreshToken(result.tokens.refresh);

      return result;
    } catch (error) {
      const apiError = handleAPIError(error as any);
      throw apiError;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if we have a refresh token
      const refreshToken = auth.tokens.refresh;
      if (refreshToken) {
        await logoutMutation(refreshToken).unwrap();
      }
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      // Clear Redux state (Redux Persist will handle storage)
      dispatch(clearAuthState());

      // Also clear tokens from AsyncStorage for API access
      await storage.clearTokens();
    }
  };

  const initializeAuth = async () => {
    // Redux Persist will automatically rehydrate the state
    // No need to manually load from storage
    console.log('Auth state will be rehydrated by Redux Persist');
  };

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Loading states
    isLoginLoading,
    isRegisterLoading,

    // Actions
    login,
    register,
    logout,
    initializeAuth,
  };
};
