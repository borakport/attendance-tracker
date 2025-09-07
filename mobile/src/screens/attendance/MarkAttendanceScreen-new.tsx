import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Surface,
  ActivityIndicator,
  Avatar,
  Chip,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { markAttendance } from '@/store/slices/attendanceSlice';
import locationService from '@/services/location.service';
import apiService from '@/services/api.service';
import { Session, AttendanceStatus } from '@/types';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MarkAttendanceScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const dispatch = useAppDispatch();
  const { loading: isMarking } = useAppSelector((state) => state.attendance);
  const { user } = useAppSelector((state) => state.auth);
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canMark, setCanMark] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [locationAddress, setLocationAddress] = useState<string>('');

  // Helper function to safely parse dates from various formats
  const safeParseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a string (ISO format or other)
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    // If it's a timestamp number
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    // Fallback
    return new Date();
  };

  useEffect(() => {
    loadSession();
    startLocationTracking();
    
    return () => {
      locationService.stopLocationTracking();
    };
  }, [sessionId]);

  useEffect(() => {
    if (userLocation && session) {
      const dist = locationService.calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        session.latitude,
        session.longitude
      );
      setDistance(dist);
      setCanMark(dist <= session.radiusMeters);
      
      // Get address for user location
      getLocationAddress(userLocation.coords.latitude, userLocation.coords.longitude);
    }
  }, [userLocation, session]);

  useEffect(() => {
    // Countdown timer for auto-refresh
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          getCurrentLocation();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLocationAddress = async (lat: number, lon: number) => {
    const address = await locationService.reverseGeocode(lat, lon);
    if (address) {
      setLocationAddress(address);
    }
  };

  const loadSession = async () => {
    try {
      const response = await apiService.getSession(sessionId);
      setSession(response.data || null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load session details',
      });
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    const success = await locationService.startLocationTracking((location) => {
      setUserLocation(location);
      setLocationError('');
    });
    
    if (!success) {
      setLocationError('Failed to start location tracking. Please enable location services.');
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      setUserLocation(location);
      setLocationError('');
    } else {
      setLocationError('Unable to get your location. Please check location permissions.');
    }
  };

  const handleMarkAttendance = async () => {
    if (!userLocation || !session) return;

    Alert.alert(
      'Confirm Attendance',
      `Mark attendance for ${session.name}?\n\nDistance: ${distance}m from session location`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(markAttendance(sessionId)).unwrap();
              
              Toast.show({
                type: 'success',
                text1: 'Attendance Marked!',
                text2: `You are ${distance}m from the session location`,
              });
              
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Failed to mark attendance',
                text2: error.message || 'Please try again',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    if (!distance) return { color: '#999', status: 'Calculating...', icon: 'map-marker-question' };
    if (!session) return { color: '#999', status: 'Loading...', icon: 'map-marker-question' };
    
    if (distance <= session.radiusMeters) {
      return { color: '#4CAF50', status: 'Within Range ✓', icon: 'map-marker-check' };
    } else if (distance <= session.radiusMeters * 1.5) {
      return { color: '#FF9800', status: 'Getting Close', icon: 'map-marker-distance' };
    } else {
      return { color: '#F44336', status: 'Too Far', icon: 'map-marker-off' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>Session not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Title style={styles.sessionTitle}>{session.name}</Title>
            <Text style={styles.courseName}>Course Session</Text>
            <View style={styles.sessionInfo}>
              <Chip icon="clock" style={styles.chip}>
                {format(safeParseDate(session.startTime), 'h:mm a')}
              </Chip>
              <Chip icon="map-marker-radius" style={styles.chip}>
                {session.radiusMeters}m radius
              </Chip>
            </View>
          </View>
        </LinearGradient>

        {/* GPS Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <Avatar.Icon
                size={64}
                icon={statusInfo.icon}
                style={{ backgroundColor: statusInfo.color }}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>GPS Status</Text>
                <Text style={[styles.statusValue, { color: statusInfo.color }]}>
                  {statusInfo.status}
                </Text>
                {distance !== null && (
                  <Text style={styles.distanceText}>
                    {locationService.formatDistance(distance)} away
                  </Text>
                )}
              </View>
            </View>

            {distance !== null && session && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={Math.max(0, 1 - (distance / (session.radiusMeters * 2)))}
                  color={statusInfo.color}
                  style={styles.progressBar}
                />
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>0m</Text>
                  <Text style={styles.progressLabel}>{session.radiusMeters}m</Text>
                  <Text style={styles.progressLabel}>{session.radiusMeters * 2}m</Text>
                </View>
              </View>
            )}

            {locationError ? (
              <Surface style={styles.errorSurface}>
                <MaterialCommunityIcons name="alert" size={20} color="#F44336" />
                <Text style={styles.errorMessage}>{locationError}</Text>
              </Surface>
            ) : (
              <View style={styles.refreshContainer}>
                <Text style={styles.refreshText}>
                  Auto-refresh in {countdown}s
                </Text>
                <Button
                  mode="text"
                  onPress={getCurrentLocation}
                  icon="refresh"
                  compact
                >
                  Refresh Now
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Location Details Card */}
        <Card style={styles.locationCard}>
          <Card.Title
            title="Location Information"
            left={(props) => <Avatar.Icon {...props} icon="map-marker-radius" style={{ backgroundColor: '#667eea' }} />}
          />
          <Card.Content>
            <List.Item
              title="Session Location"
              description={session.locationName || `${session.latitude.toFixed(6)}, ${session.longitude.toFixed(6)}`}
              left={props => <List.Icon {...props} icon="school" color="#667eea" />}
            />
            <Divider />
            {userLocation && (
              <>
                <List.Item
                  title="Your Location"
                  description={locationAddress || `${userLocation.coords.latitude.toFixed(6)}, ${userLocation.coords.longitude.toFixed(6)}`}
                  left={props => <List.Icon {...props} icon="account-marker" color="#4CAF50" />}
                />
                <Divider />
                <List.Item
                  title="GPS Accuracy"
                  description={`±${Math.round(userLocation.coords.accuracy || 0)}m`}
                  left={props => <List.Icon {...props} icon="crosshairs-gps" />}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Visual Distance Indicator */}
        <Card style={styles.visualCard}>
          <Card.Content>
            <View style={styles.visualContainer}>
              <View style={styles.circleContainer}>
                {/* Session radius circle */}
                <View style={[styles.radiusCircle, { backgroundColor: statusInfo.color + '20' }]}>
                  <View style={styles.sessionPoint}>
                    <MaterialCommunityIcons name="school" size={32} color="#667eea" />
                  </View>
                  {userLocation && distance !== null && (
                    <View 
                      style={[
                        styles.userPoint,
                        {
                          top: distance > session.radiusMeters ? 20 : 50,
                          backgroundColor: statusInfo.color,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons name="account" size={20} color="white" />
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.radiusLabel}>
                Session Radius: {session.radiusMeters}m
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleMarkAttendance}
            disabled={!canMark || isMarking || !userLocation}
            style={[
              styles.markButton,
              { backgroundColor: canMark ? '#4CAF50' : '#999' }
            ]}
            contentStyle={styles.markButtonContent}
            icon="check-circle"
          >
            {isMarking ? (
              <ActivityIndicator color="white" />
            ) : !userLocation ? (
              'Getting Location...'
            ) : canMark ? (
              'Mark Attendance'
            ) : (
              `Move ${locationService.formatDistance(Math.max(0, (distance || 0) - session.radiusMeters))} closer`
            )}
          </Button>

          <Text style={styles.helpText}>
            You must be within {session.radiusMeters}m of the session location to mark attendance
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#F44336',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  sessionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  courseName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  sessionInfo: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  statusLabel: {
    color: '#666',
    fontSize: 14,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  distanceText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  errorSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginTop: 12,
  },
  errorMessage: {
    marginLeft: 8,
    color: '#F44336',
    flex: 1,
    fontSize: 14,
  },
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  refreshText: {
    color: '#666',
    fontSize: 14,
  },
  locationCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },
  visualCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },
  visualContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
  },
  sessionPoint: {
    position: 'absolute',
  },
  userPoint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusLabel: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    padding: 16,
  },
  markButton: {
    borderRadius: 30,
    elevation: 4,
  },
  markButtonContent: {
    paddingVertical: 12,
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
