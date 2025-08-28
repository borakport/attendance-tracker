import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Title,
  Switch,
  List,
  Divider,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '@/hooks/redux';
import apiService from '@/services/api.service';
import { format } from 'date-fns';

export default function CreateCourseScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // 90 days from now
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Settings
  const [gpsRadius, setGpsRadius] = useState('50');
  const [allowLateEntry, setAllowLateEntry] = useState(true);
  const [lateEntryMinutes, setLateEntryMinutes] = useState('15');
  const [requireSelfie, setRequireSelfie] = useState(false);
  const [autoEndSession, setAutoEndSession] = useState(true);
  const [autoEndMinutes, setAutoEndMinutes] = useState('30');
  
  // Validation errors
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!name.trim()) newErrors.name = 'Course name is required';
    if (name.length < 3) newErrors.name = 'Course name must be at least 3 characters';
    
    if (!code.trim()) newErrors.code = 'Course code is required';
    if (code.length < 6) newErrors.code = 'Course code must be at least 6 characters';
    
    if (endDate <= startDate) newErrors.date = 'End date must be after start date';
    
    const radius = parseInt(gpsRadius);
    if (isNaN(radius) || radius < 10 || radius > 500) {
      newErrors.gpsRadius = 'GPS radius must be between 10 and 500 meters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCourse = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const courseData = {
        name: name.trim(),
        description: description.trim(),
        code: code.toUpperCase(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        settings: {
          gpsRadius: parseInt(gpsRadius),
          allowLateEntry,
          lateEntryMinutes: parseInt(lateEntryMinutes),
          requireSelfie,
          autoEndSession,
          autoEndMinutes: parseInt(autoEndMinutes),
        },
      };
      
      await apiService.createCourse(courseData);
      
      Toast.show({
        type: 'success',
        text1: 'Course Created!',
        text2: `${name} has been created successfully`,
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to create course',
        text2: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Course Information</Title>
              
              <TextInput
                label="Course Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
              
              <TextInput
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              
              <View style={styles.codeContainer}>
                <TextInput
                  label="Course Code"
                  value={code}
                  onChangeText={setCode}
                  mode="outlined"
                  error={!!errors.code}
                  style={styles.codeInput}
                  autoCapitalize="characters"
                />
                <Button
                  mode="outlined"
                  onPress={generateCode}
                  style={styles.generateButton}
                >
                  Generate
                </Button>
              </View>
              <HelperText type="error" visible={!!errors.code}>
                {errors.code}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Duration</Title>
              
              <List.Item
                title="Start Date"
                description={format(startDate, 'MMMM dd, yyyy')}
                left={props => <List.Icon {...props} icon="calendar-start" />}
                onPress={() => Toast.show({ type: 'info', text1: 'Date picker coming soon' })}
              />
              
              <Divider />
              
              <List.Item
                title="End Date"
                description={format(endDate, 'MMMM dd, yyyy')}
                left={props => <List.Icon {...props} icon="calendar-end" />}
                onPress={() => Toast.show({ type: 'info', text1: 'Date picker coming soon' })}
              />
              
              <HelperText type="error" visible={!!errors.date}>
                {errors.date}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Attendance Settings</Title>
              
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
              
              <List.Item
                title="Allow Late Entry"
                description="Students can mark attendance after session starts"
                left={props => <List.Icon {...props} icon="clock-alert" />}
                right={() => (
                  <Switch
                    value={allowLateEntry}
                    onValueChange={setAllowLateEntry}
                  />
                )}
              />
              
              {allowLateEntry && (
                <TextInput
                  label="Late Entry Minutes"
                  value={lateEntryMinutes}
                  onChangeText={setLateEntryMinutes}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
              
              <List.Item
                title="Require Selfie"
                description="Students must take a photo when marking attendance"
                left={props => <List.Icon {...props} icon="camera" />}
                right={() => (
                  <Switch
                    value={requireSelfie}
                    onValueChange={setRequireSelfie}
                  />
                )}
              />
              
              <List.Item
                title="Auto-End Sessions"
                description="Automatically end sessions after scheduled time"
                left={props => <List.Icon {...props} icon="timer-off" />}
                right={() => (
                  <Switch
                    value={autoEndSession}
                    onValueChange={setAutoEndSession}
                  />
                )}
              />
              
              {autoEndSession && (
                <TextInput
                  label="Extra Minutes After End Time"
                  value={autoEndMinutes}
                  onChangeText={setAutoEndMinutes}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleCreateCourse}
              disabled={loading}
              style={styles.createButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'Create Course'}
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
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
  card: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#667eea',
  },
  input: {
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeInput: {
    flex: 1,
  },
  generateButton: {
    marginTop: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  createButton: {
    backgroundColor: '#667eea',
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
