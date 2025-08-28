import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { loadStoredAuth } from '@/store/slices/authSlice';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '@/screens/LoadingScreen';
import socketService from '@/services/socket.service';

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
      await dispatch(loadStoredAuth()).unwrap();
      setIsFirstLaunch(false);
    } catch (error) {
      console.log('No stored auth');
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
    </Stack.Navigator>
  );
}
