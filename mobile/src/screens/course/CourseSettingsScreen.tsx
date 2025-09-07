import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Switch,
  HelperText,
  ActivityIndicator,
  List,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import apiService from '@/services/api.service';
import PasswordVerificationDialog from '@/components/PasswordVerificationDialog';

export default function CourseSettingsScreen({ navigation, route }: any) {
  const { course } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Settings fields
  const [gpsRadius, setGpsRadius] = useState(course.settings.gpsRadius?.toString() || '50');
  const [allowLateEntry, setAllowLateEntry] = useState(course.settings.allowLateEntry ?? true);
  const [lateEntryMinutes, setLateEntryMinutes] = useState(course.settings.lateEntryMinutes?.toString() || '15');
  const [requireSelfie, setRequireSelfie] = useState(course.settings.requireSelfie ?? false);
  const [autoEndSession, setAutoEndSession] = useState(course.settings.autoEndSession ?? true);
  const [autoEndMinutes, setAutoEndMinutes] = useState(course.settings.autoEndMinutes?.toString() || '15');
  
  // Validation errors
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    const radius = parseInt(gpsRadius);
    if (isNaN(radius) || radius < 10 || radius > 500) {
      newErrors.gpsRadius = 'GPS radius must be between 10 and 500 meters';
    }
    
    if (allowLateEntry) {
      const lateMinutes = parseInt(lateEntryMinutes);
      if (isNaN(lateMinutes) || lateMinutes < 1 || lateMinutes > 60) {
        newErrors.lateEntryMinutes = 'Late entry minutes must be between 1 and 60';
      }
    }
    
    if (autoEndSession) {
      const autoMinutes = parseInt(autoEndMinutes);
      if (isNaN(autoMinutes) || autoMinutes < 15 || autoMinutes > 480) {
        newErrors.autoEndMinutes = 'Auto end minutes must be between 15 and 480';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateSettings = async () => {
    if (!validateForm()) return;
    setShowPasswordDialog(true);
  };

  const handlePasswordVerification = async (password: string) => {
    setLoading(true);
    try {
      const settingsData = {
        gpsRadius: parseInt(gpsRadius),
        allowLateEntry,
        lateEntryMinutes: allowLateEntry ? parseInt(lateEntryMinutes) : 15,
        requireSelfie,
        autoEndSession,
        autoEndMinutes: autoEndSession ? parseInt(autoEndMinutes) : 15,
      };
      
      console.log('Updating course settings with data:', JSON.stringify(settingsData, null, 2));
      
      await apiService.updateCourseSettings(course.id, {
        settings: settingsData,
        password,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Settings Updated!',
        text2: `${course.name} settings have been updated successfully`,
      });
      
      setShowPasswordDialog(false);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating course settings:', error);
      
      const message = error.response?.data?.message || 'Failed to update course settings';
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: message,
      });
      
      throw error; // Re-throw to show error in dialog
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Location Settings</Title>
              
              <TextInput
                label="GPS Radius (meters)"
                value={gpsRadius}
                onChangeText={setGpsRadius}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.gpsRadius}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.gpsRadius}>
                {errors.gpsRadius}
              </HelperText>
              <HelperText type="info">
                Distance in meters students can be from session location to mark attendance
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Late Entry Settings</Title>
              
              <List.Item
                title="Allow Late Entry"
                description="Allow students to join sessions after they have started"
                right={() => (
                  <Switch
                    value={allowLateEntry}
                    onValueChange={setAllowLateEntry}
                  />
                )}
              />
              
              {allowLateEntry && (
                <>
                  <Divider style={styles.divider} />
                  <TextInput
                    label="Late Entry Duration (minutes)"
                    value={lateEntryMinutes}
                    onChangeText={setLateEntryMinutes}
                    mode="outlined"
                    keyboardType="numeric"
                    error={!!errors.lateEntryMinutes}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.lateEntryMinutes}>
                    {errors.lateEntryMinutes}
                  </HelperText>
                  <HelperText type="info">
                    How long after session start students can still join
                  </HelperText>
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Verification Settings</Title>
              
              <List.Item
                title="Require Selfie"
                description="Students must take a selfie when marking attendance"
                right={() => (
                  <Switch
                    value={requireSelfie}
                    onValueChange={setRequireSelfie}
                  />
                )}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Session Management</Title>
              
              <List.Item
                title="Auto End Session"
                description="Automatically end sessions after a specified duration"
                right={() => (
                  <Switch
                    value={autoEndSession}
                    onValueChange={setAutoEndSession}
                  />
                )}
              />
              
              {autoEndSession && (
                <>
                  <Divider style={styles.divider} />
                  <TextInput
                    label="Auto End Duration (minutes)"
                    value={autoEndMinutes}
                    onChangeText={setAutoEndMinutes}
                    mode="outlined"
                    keyboardType="numeric"
                    error={!!errors.autoEndMinutes}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={!!errors.autoEndMinutes}>
                    {errors.autoEndMinutes}
                  </HelperText>
                  <HelperText type="info">
                    Sessions will automatically end after this duration
                  </HelperText>
                </>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUpdateSettings}
            loading={loading}
            disabled={loading}
            style={styles.updateButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? <ActivityIndicator color="white" /> : 'Update Settings'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>

        <PasswordVerificationDialog
          visible={showPasswordDialog}
          title="Confirm Settings Update"
          message="Please enter your password to confirm the settings changes."
          onVerify={handlePasswordVerification}
          onDismiss={() => setShowPasswordDialog(false)}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  updateButton: {
    backgroundColor: '#667eea',
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#666',
  },
  buttonContent: {
    height: 48,
  },
});
