import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { loadStoredAuth, refreshToken } from '@/store/slices/authSlice';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '@/screens/LoadingScreen';
import TermsScreen from '@/screens/legal/TermsScreen';
import PrivacyScreen from '@/screens/legal/PrivacyScreen';
import socketService from '@/services/socket.service';
import apiService from '@/services/api.service';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket when authenticated
      socketService.connect();
    } else {
      // Disconnect when not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  const initializeApp = async () => {
    try {
      // Check for stored authentication
      const authResult = await dispatch(loadStoredAuth()).unwrap();
      
      if (authResult && authResult.tokens) {
        // We have stored tokens, try to refresh to ensure they're valid
        try {
          await dispatch(refreshToken()).unwrap();
          console.log('🔄 Token refreshed successfully on app start');
        } catch (refreshError) {
          console.log('❌ Token refresh failed on app start:', refreshError);
          // If refresh fails, user will need to login again
        }
      }
      
      setIsFirstLaunch(false);
    } catch (error) {
      console.log('No stored auth');
      // Try to check if we have tokens and attempt refresh
      const hasTokens = await apiService.hasValidTokens();
      if (hasTokens) {
        try {
          await dispatch(refreshToken()).unwrap();
          console.log('🔄 Token refreshed from stored tokens');
        } catch (refreshError) {
          console.log('❌ Failed to refresh stored tokens:', refreshError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          {isFirstLaunch && (
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          )}
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
      
      {/* Legal screens available globally */}
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{ 
          headerShown: true,
          title: 'Terms of Service',
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{ 
          headerShown: true,
          title: 'Privacy Policy',
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: 'white',
        }}
      />
    </Stack.Navigator>
  );
}
