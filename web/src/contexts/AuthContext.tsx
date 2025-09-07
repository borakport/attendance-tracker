'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@/types';
import { APP_CONFIG } from '@/constants';
import { apiClient } from '@/services/api';
import { authAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);

        if (userData && token) {
          const user = JSON.parse(userData);
          
          // Validate token by making a test API call
          try {
            console.log('🔄 Validating stored token...');
            await authAPI.getProfile();
            console.log('✅ Token is valid, restoring auth state');
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } catch (tokenError) {
            console.warn('❌ Stored token is invalid:', tokenError);
            // Token is expired or invalid, clear storage
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          console.log('🚫 No stored auth data found');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 AuthContext login called with:', { email, password: '***' });
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('📡 Calling authAPI.login...');
      // Use real API to authenticate
      const response = await authAPI.login({ email, password });
      console.log('✅ authAPI.login successful, dispatching AUTH_SUCCESS');
      
      // User data and token are already stored by the API client
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend to invalidate session
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      // Fetch fresh user data from backend
      const updatedUser = await authAPI.getProfile();
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, might need to re-authenticate
      dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
