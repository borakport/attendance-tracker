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
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import locationService from '@/services/location.service';
import { format } from 'date-fns';

export default function CreateSessionScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours from now
  const [startInMinutes, setStartInMinutes] = useState('5'); // Minutes from now to start
  
  // Location
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('50');
  
  // Settings
  const [allowLateEntry, setAllowLateEntry] = useState(true);
  const [lateMinutes, setLateMinutes] = useState('5');
  const [requireSelfie, setRequireSelfie] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<any>({});

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setLatitude(location.coords.latitude.toString());
        setLongitude(location.coords.longitude.toString());
        
        // Get address
        const address = await locationService.reverseGeocode(
          location.coords.latitude,
          location.coords.longitude
        );
        if (address) {
          setLocationName(address);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Location Set',
          text2: 'Current location has been captured',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: 'Could not get current location',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Failed to get location',
      });
    } finally {
      setGettingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!name.trim()) newErrors.name = 'Session name is required';
    if (name.length < 3) newErrors.name = 'Session name must be at least 3 characters';
    
    // Validate startInMinutes
    const startMinutes = parseInt(startInMinutes);
    if (isNaN(startMinutes) || startMinutes < 0) {
      newErrors.startInMinutes = 'Start time must be 0 or more minutes from now';
    }
    
    if (endTime <= startTime) newErrors.time = 'End time must be after start time';
    
    if (!latitude || !longitude) {
      newErrors.location = 'Location is required';
    } else {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.location = 'Invalid latitude';
      }
      if (isNaN(lon) || lon < -180 || lon > 180) {
        newErrors.location = 'Invalid longitude';
      }
    }
    
    const radius = parseInt(radiusMeters);
    if (isNaN(radius) || radius < 10 || radius > 500) {
      newErrors.radius = 'Radius must be between 10 and 500 meters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSession = async () => {
    if (!validateForm()) return;
    
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not found. Please login again.',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Calculate session times based on startInMinutes
      const now = new Date();
      const calculatedStartTime = new Date(now.getTime() + parseInt(startInMinutes) * 60 * 1000);
      // For simplicity, make session 2 hours long by default when using startInMinutes
      const calculatedEndTime = new Date(calculatedStartTime.getTime() + 2 * 60 * 60 * 1000);
      
      const sessionData = {
        courseId,
        instructorId: user.id,
        name: name.trim(),
        description: description.trim(),
        startTime: calculatedStartTime.toISOString(),
        endTime: calculatedEndTime.toISOString(),
        startInMinutes: parseInt(startInMinutes), // Add the new parameter
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseInt(radiusMeters),
        locationName: locationName.trim(),
        allowLateEntry,
        lateMinutes: parseInt(lateMinutes),
        requireSelfie,
        notes: description.trim(),
      };
      
      await apiService.createSession(sessionData);
      
      Toast.show({
        type: 'success',
        text1: 'Session Created!',
        text2: `${name} has been created successfully`,
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to create session',
        text2: error.message || 'Please try again',
      });
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Session Information</Title>
              
              <TextInput
                label="Session Name"
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
                numberOfLines={2}
                style={styles.input}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Schedule</Title>
              
              <TextInput
                label="Start in Minutes (from now)"
                value={startInMinutes}
                onChangeText={setStartInMinutes}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.startInMinutes}
                style={styles.input}
                placeholder="e.g., 5 for 5 minutes from now"
              />
              <HelperText type="error" visible={!!errors.startInMinutes}>
                {errors.startInMinutes}
              </HelperText>
              <HelperText type="info" visible={!errors.startInMinutes}>
                Session will start {startInMinutes} minutes from now ({
                  format(new Date(Date.now() + parseInt(startInMinutes || '0') * 60 * 1000), 'MMM dd, h:mm a')
                }) and end 2 hours later
              </HelperText>
              
              <List.Item
                title="Start Time"
                description={format(startTime, 'MMM dd, yyyy - h:mm a')}
                left={props => <List.Icon {...props} icon="clock-start" />}
                onPress={() => Toast.show({ type: 'info', text1: 'Time picker coming soon' })}
              />
              
              <List.Item
                title="End Time"
                description={format(endTime, 'MMM dd, yyyy - h:mm a')}
                left={props => <List.Icon {...props} icon="clock-end" />}
                onPress={() => Toast.show({ type: 'info', text1: 'Time picker coming soon' })}
              />
              
              <HelperText type="error" visible={!!errors.time}>
                {errors.time}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Location</Title>
              
              <Button
                mode="contained"
                onPress={getCurrentLocation}
                loading={gettingLocation}
                disabled={gettingLocation}
                icon="crosshairs-gps"
                style={styles.locationButton}
              >
                Use Current Location
              </Button>
              
              {locationName ? (
                <Text style={styles.locationText}>{locationName}</Text>
              ) : null}
              
              <View style={styles.coordinatesContainer}>
                <TextInput
                  label="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.coordinateInput}
                />
                <TextInput
                  label="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.coordinateInput}
                />
              </View>
              
              <TextInput
                label="Location Name (Optional)"
                value={locationName}
                onChangeText={setLocationName}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="GPS Radius (meters)"
                value={radiusMeters}
                onChangeText={setRadiusMeters}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.radius}
                style={styles.input}
              />
              
              <HelperText type="error" visible={!!errors.location || !!errors.radius}>
                {errors.location || errors.radius}
              </HelperText>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Settings</Title>
              
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
                  value={lateMinutes}
                  onChangeText={setLateMinutes}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
              
              <List.Item
                title="Require Selfie"
                description="Students must take a photo"
                left={props => <List.Icon {...props} icon="camera" />}
                right={() => (
                  <Switch
                    value={requireSelfie}
                    onValueChange={setRequireSelfie}
                  />
                )}
              />
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleCreateSession}
              disabled={loading}
              style={styles.createButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'Create Session'}
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
  locationButton: {
    marginBottom: 16,
    backgroundColor: '#667eea',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  coordinateInput: {
    flex: 1,
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
