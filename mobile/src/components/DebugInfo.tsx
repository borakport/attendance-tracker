import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { Config } from '@/constants/config';

export const DebugInfo: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Not tested');
  const [attendanceStatus, setAttendanceStatus] = useState<string>('Not tested');

  const testAuthService = async () => {
    try {
      setAuthStatus('Testing...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${Config.API.AUTH_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setAuthStatus('✅ Connected');
      } else {
        setAuthStatus(`❌ Error ${response.status}`);
      }
    } catch (error: any) {
      setAuthStatus(`❌ ${error.message}`);
    }
  };

  const testAttendanceService = async () => {
    try {
      setAttendanceStatus('Testing...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${Config.API.ATTENDANCE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setAttendanceStatus('✅ Connected');
      } else {
        setAttendanceStatus(`❌ Error ${response.status}`);
      }
    } catch (error: any) {
      setAttendanceStatus(`❌ ${error.message}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="API Configuration" />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Auth URL: {Config.API.AUTH_URL}
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
            Attendance URL: {Config.API.ATTENDANCE_URL}
          </Text>
          <Text variant="bodyMedium">
            Realtime URL: {Config.API.REALTIME_URL}
          </Text>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Service Health Check" />
        <Card.Content>
          <View style={{ marginBottom: 12 }}>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              Auth Service: {authStatus}
            </Text>
            <Button mode="outlined" onPress={testAuthService}>
              Test Auth Service
            </Button>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              Attendance Service: {attendanceStatus}
            </Text>
            <Button mode="outlined" onPress={testAttendanceService}>
              Test Attendance Service
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Environment Variables" />
        <Card.Content>
          <Text variant="bodyMedium">ENV: {process.env.EXPO_PUBLIC_ENV}</Text>
          <Text variant="bodyMedium">DEBUG: {process.env.EXPO_PUBLIC_DEBUG_MODE}</Text>
          <Text variant="bodyMedium">APP NAME: {process.env.EXPO_PUBLIC_APP_NAME}</Text>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Features" />
        <Card.Content>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip icon="fingerprint">
              {Config.FEATURES.BIOMETRIC_AUTH ? 'Biometric ✓' : 'Biometric ✗'}
            </Chip>
            <Chip icon="camera">
              {Config.FEATURES.CAMERA_SELFIE ? 'Camera ✓' : 'Camera ✗'}
            </Chip>
            <Chip icon="bell">
              {Config.FEATURES.NOTIFICATIONS ? 'Notifications ✓' : 'Notifications ✗'}
            </Chip>
            <Chip icon="map-marker">
              {Config.FEATURES.BACKGROUND_LOCATION ? 'Location ✓' : 'Location ✗'}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};
