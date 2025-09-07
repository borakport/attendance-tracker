/**
 * Authentication Redux Slice
 * 
 * This slice manages the authentication state for the mobile application using Redux Toolkit.
 * It handles user authentication, token management, and persistent storage of auth data.
 * 
 * Key Features:
 * - User sign in/sign up with JWT token management
 * - Persistent storage using AsyncStorage
 * - Automatic token refresh handling
 * - User profile management
 * - Loading and error state management
 * 
 * State Management:
 * - Authentication status tracking
 * - User profile data storage
 * - Token pair management (access + refresh)
 * - Error handling for auth operations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/types';
import ApiService from '@/services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';

/**
 * Authentication State Interface
 * Defines the shape of authentication state in Redux store
 */
interface AuthState {
  user: User | null;           // Current authenticated user data
  tokens: AuthTokens | null;   // JWT access and refresh tokens
  isAuthenticated: boolean;    // Authentication status flag
  isLoading: boolean;         // Loading state for async operations
  error: string | null;       // Error message from failed operations
}

/**
 * Initial authentication state
 * All values start as null/false until authentication occurs
 */
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// =====================================
// ASYNC THUNKS - Asynchronous Actions
// =====================================

/**
 * Sign In Async Thunk
 * 
 * Handles user authentication with email and password.
 * Stores authentication tokens and user data in AsyncStorage for persistence.
 * 
 * @param credentials - Object containing email and password
 * @returns Promise resolving to user and tokens data
 */
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await ApiService.signIn(email, password);
    if (response.success) {
      const { user, tokens } = response.data;
      
      // Store authentication data in device storage for persistence
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, tokens };
    }
    throw new Error(response.message);
  }
);

/**
 * Sign Up Async Thunk
 * 
 * Handles new user registration and automatic sign in.
 * Creates user account and immediately authenticates the user.
 * 
 * @param userData - User registration data
 * @returns Promise resolving to user and tokens data
 */
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData: any) => {
    const response = await ApiService.signUp(userData);
    if (response.success) {
      const { user, tokens } = response.data;
      
      // Store authentication data in device storage for persistence
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, tokens };
    }
    throw new Error(response.message);
  }
);

/**
 * Sign Out Async Thunk
 * 
 * Handles user logout by clearing stored authentication data
 * and notifying the backend to invalidate tokens.
 */
export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    // Notify backend to invalidate tokens
    await ApiService.signOut();
    
    // Clear stored authentication data
    await AsyncStorage.multiRemove([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);
    
    return null;
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async () => {
    const [token, refreshToken, userData] = await AsyncStorage.multiGet([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);

    if (token[1] && refreshToken[1] && userData[1]) {
      return {
        user: JSON.parse(userData[1]),
        tokens: {
          accessToken: token[1],
          refreshToken: refreshToken[1],
        },
      };
    }
    return null;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>) => {
    const response = await ApiService.updateProfile(userData);
    if (response.success) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      return response.data;
    }
    throw new Error(response.message);
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await ApiService.refreshAuthToken();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      });

    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      });

    // Sign Out
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Load Stored Auth
    builder
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.tokens = action.payload;
        }
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.tokens = null;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string || 'Token refresh failed';
      });
  },
});

export const { clearError, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
