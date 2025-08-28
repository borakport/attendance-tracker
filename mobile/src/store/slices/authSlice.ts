import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/types';
import ApiService from '@/services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await ApiService.signIn(email, password);
    if (response.success) {
      const { user, tokens } = response.data;
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, tokens };
    }
    throw new Error(response.message);
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData: any) => {
    const response = await ApiService.signUp(userData);
    if (response.success) {
      const { user, tokens } = response.data;
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, tokens };
    }
    throw new Error(response.message);
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await ApiService.signOut();
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
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
