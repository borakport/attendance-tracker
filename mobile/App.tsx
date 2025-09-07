/**
 * GPS Attendance Tracker - Mobile Application
 * 
 * Copyright (c) 2025 ORN Borakport (Backend & Web Interface) and MON Dina (Mobile App)
 * Licensed under the MIT License
 * 
 * Main application component for React Native mobile app
 * Developed by: MON Dina
 */

import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { store } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { setNavigationRef, setStoreRef } from '@/services/api.service';
import { useSystemTheme } from '@/hooks/useSystemTheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Deep linking configuration
const linking = {
  prefixes: [Linking.createURL('/'), 'gpsattendance://'],
  config: {
    screens: {
      Auth: {
        path: '/auth',
        screens: {
          VerifyEmail: 'verify-email',
          ResetPassword: 'reset-password',
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: 'main',
    },
  },
};

// Themed App Component
const ThemedApp: React.FC = () => {
  const { theme, isDarkMode } = useSystemTheme();
  const [isReady, setIsReady] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    // Set up API service references
    setStoreRef(store);
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        // await Font.loadAsync(customFonts);
        
        // Artificially delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer 
          ref={navigationRef}
          linking={linking}
          onReady={() => {
            if (navigationRef.current) {
              setNavigationRef(navigationRef.current);
            }
          }}
        >
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemedApp />
      </Provider>
    </ErrorBoundary>
  );
}
