import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Removed react-native-maps dependency
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

// Safe date formatting helper
const safeFormatDate = (dateValue: any, formatString: string, fallback: string = 'N/A'): string => {
  try {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

export default function MarkAttendanceScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.attendance);
  const { user } = useAppSelector((state) => state.auth);
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canMark, setCanMark] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [countdown, setCountdown] = useState(10);
  const isMountedRef = useRef(true);

  // Set navigation options with close button
  useEffect(() => {
    navigation.setOptions({
      title: 'Mark Attendance',
      headerRight: () => (
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            // Navigate back to the sessions list only if component is mounted
            if (isMountedRef.current) {
              navigation.navigate('AttendanceHistory');
            }
          }}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadSession();
    // Don't automatically start location tracking - wait for user action
    
    return () => {
      // Cleanup location tracking and mark component as unmounted
      isMountedRef.current = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (userLocation && session) {
      console.log('Distance calculation inputs:', {
        userLat: userLocation.coords.latitude,
        userLon: userLocation.coords.longitude,
        sessionLat: session.latitude,
        sessionLon: session.longitude,
        userCoordsType: typeof userLocation.coords.latitude,
        sessionCoordsType: typeof session.latitude
      });
      
      // Convert session coordinates to numbers if they're strings
      const sessionLat = typeof session.latitude === 'string' ? parseFloat(session.latitude) : session.latitude;
      const sessionLon = typeof session.longitude === 'string' ? parseFloat(session.longitude) : session.longitude;
      
      console.log('Converted coordinates:', {
        sessionLat,
        sessionLon,
        sessionLatType: typeof sessionLat,
        sessionLonType: typeof sessionLon
      });
      
      // Check if session has valid coordinates (after conversion)
      if (sessionLat != null && sessionLon != null && 
          !isNaN(sessionLat) && !isNaN(sessionLon) && 
          isFinite(sessionLat) && isFinite(sessionLon)) {
        
        // Also check user coordinates
        if (userLocation.coords.latitude != null && userLocation.coords.longitude != null &&
            !isNaN(userLocation.coords.latitude) && !isNaN(userLocation.coords.longitude)) {
          
          const dist = locationService.calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            sessionLat,
            sessionLon
          );
          
          console.log('Calculated distance:', dist, 'meters');
          
          // Ensure distance is a valid number
          if (!isNaN(dist) && isFinite(dist)) {
            setDistance(dist);
            setCanMark(dist <= session.radiusMeters);
          } else {
            console.warn('Calculated distance is invalid:', dist);
            setDistance(null);
            setCanMark(false);
            setLocationError('Unable to calculate distance to session location');
          }
        } else {
          console.warn('User coordinates are invalid:', {
            userLat: userLocation.coords.latitude,
            userLon: userLocation.coords.longitude
          });
          setDistance(null);
          setCanMark(false);
          setLocationError('Unable to get accurate location coordinates');
        }
      } else {
        console.warn('Session coordinates are invalid even after conversion:', {
          originalLat: session.latitude,
          originalLon: session.longitude,
          convertedLat: sessionLat,
          convertedLon: sessionLon
        });
        setDistance(null);
        setCanMark(false);
        setLocationError('Session location not configured properly');
      }
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

  const loadSession = async () => {
    try {
      console.log('Loading session with ID:', sessionId);
      const response = await apiService.getSession(sessionId);
      if (response.data) {
        const rawSessionData = response.data;
        console.log('Raw session data received:', {
          id: rawSessionData.id,
          name: rawSessionData.name,
          startTime: rawSessionData.startTime,
          endTime: rawSessionData.endTime,
          startTimeType: typeof rawSessionData.startTime,
          latitude: rawSessionData.latitude,
          longitude: rawSessionData.longitude,
          latitudeType: typeof rawSessionData.latitude,
          longitudeType: typeof rawSessionData.longitude,
          radiusMeters: rawSessionData.radiusMeters
        });
        
        // Process session data to ensure proper format
        const processedSession = {
          ...rawSessionData,
          // Ensure dates are properly formatted as ISO strings
          startTime: rawSessionData.startTime ? 
            (typeof rawSessionData.startTime === 'string' ? rawSessionData.startTime : new Date(rawSessionData.startTime).toISOString()) : 
            new Date().toISOString(),
          endTime: rawSessionData.endTime ? 
            (typeof rawSessionData.endTime === 'string' ? rawSessionData.endTime : new Date(rawSessionData.endTime).toISOString()) : 
            new Date().toISOString(),
          // Ensure location data is properly formatted
          latitude: typeof rawSessionData.latitude === 'number' ? rawSessionData.latitude : parseFloat(rawSessionData.latitude) || 0,
          longitude: typeof rawSessionData.longitude === 'number' ? rawSessionData.longitude : parseFloat(rawSessionData.longitude) || 0,
          locationName: rawSessionData.locationName || 'Location not specified',
          // Ensure radius is a number
          radiusMeters: typeof rawSessionData.radiusMeters === 'number' ? rawSessionData.radiusMeters : parseFloat(rawSessionData.radiusMeters) || 50,
          // Ensure boolean values
          isActive: Boolean(rawSessionData.isActive),
          allowLateEntry: Boolean(rawSessionData.allowLateEntry),
          requireSelfie: Boolean(rawSessionData.requireSelfie),
          // Ensure numeric values
          lateMinutes: typeof rawSessionData.lateMinutes === 'number' ? rawSessionData.lateMinutes : parseInt(rawSessionData.lateMinutes) || 15,
        };
        
        console.log('Processed session data for attendance:', {
          id: processedSession.id,
          name: processedSession.name,
          latitude: processedSession.latitude,
          longitude: processedSession.longitude,
          radiusMeters: processedSession.radiusMeters,
          locationName: processedSession.locationName
        });
        
        setSession(processedSession);
      } else {
        console.warn('No session data received');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load session details',
      });
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    const success = await locationService.startLocationTracking((location) => {
      setUserLocation(location);
      setLocationError('');
    });
    
    if (!success) {
      setLocationError('Failed to start location tracking');
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
      setLocationError('Unable to get your location');
    }
  };

  const requestLocationAndStartTracking = async (): Promise<boolean> => {
    try {
      // First check if we already have permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Show permission request dialog
        Alert.alert(
          'Location Permission Required',
          'This app needs access to your location to verify your attendance. Please grant location permission.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Allow Location',
              onPress: async () => {
                const success = await locationService.requestPermissions();
                if (success) {
                  await startLocationTracking();
                } else {
                  setLocationError('Location permission is required to mark attendance');
                  Toast.show({
                    type: 'error',
                    text1: 'Permission Required',
                    text2: 'Please enable location permissions in your device settings',
                    visibilityTime: 4000,
                  });
                }
              }
            }
          ],
          { cancelable: false }
        );
        return false;
      } else {
        // We have permissions, start tracking
        await startLocationTracking();
        return true;
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setLocationError('Failed to request location permissions');
      return false;
    }
  };

  const handleMarkAttendance = async () => {
    if (!session) return;

    // Check if we have location data, if not try to get it
    if (!userLocation) {
      const locationGranted = await requestLocationAndStartTracking();
      if (!locationGranted) {
        return; // User denied permission or there was an error
      }
      
      // Wait a moment for location to be acquired
      Toast.show({
        type: 'info',
        text1: 'Getting your location...',
        text2: 'Please wait while we determine your position',
      });
      
      // Give some time for location to be acquired
      setTimeout(() => {
        if (!userLocation) {
          Toast.show({
            type: 'error',
            text1: 'Location Required',
            text2: 'Unable to get your location. Please try again.',
          });
        }
      }, 5000);
      
      return;
    }

    Alert.alert(
      'Confirm Attendance',
      `Mark attendance for ${session.name}?\n\nDistance: ${distance !== null ? distance : 'Calculating...'}m from session location`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              if (!userLocation) {
                Toast.show({
                  type: 'error',
                  text1: 'Location Required',
                  text2: 'Please enable location access and try again',
                });
                return;
              }
              
              await dispatch(markAttendance({
                sessionId,
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              })).unwrap();
              
              Toast.show({
                type: 'success',
                text1: 'Attendance Marked!',
                text2: `You are ${distance !== null && !isNaN(distance) ? Math.round(distance) : 'within'}m from the session location`,
              });
              
              // Small delay to ensure Redux state updates complete
              setTimeout(() => {
                // Only navigate if component is still mounted
                if (isMountedRef.current) {
                  try {
                    navigation.navigate('AttendanceHistory');
                  } catch (navError) {
                    console.error('Navigation error after marking attendance:', navError);
                    // Fallback to goBack if navigate fails
                    navigation.goBack();
                  }
                }
              }, 100);
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
    if (distance === null || distance === undefined || isNaN(distance)) {
      return { color: '#999', status: 'Calculating...' };
    }
    if (!session) return { color: '#999', status: 'Loading...' };
    
    if (distance <= session.radiusMeters) {
      return { color: '#4CAF50', status: 'Within Range ✓' };
    } else if (distance <= session.radiusMeters * 1.5) {
      return { color: '#FF9800', status: 'Getting Close' };
    } else {
      return { color: '#F44336', status: 'Too Far' };
    }
  };

  if (isLoading) {
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
            <Text style={styles.courseName}>Course ID: {session.courseId}</Text>
            <View style={styles.sessionInfo}>
              <Chip icon="clock" style={styles.chip}>
                {safeFormatDate(session.startTime, 'h:mm a', 'Time TBD')}
              </Chip>
              <Chip icon="map-marker-radius" style={styles.chip}>
                {session.radiusMeters}m radius
              </Chip>
            </View>
          </View>
        </LinearGradient>

        <Card style={styles.locationCard}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <Avatar.Icon
                size={48}
                icon="map-marker-check"
                style={{ backgroundColor: statusInfo.color }}
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Your Status</Text>
                <Text style={[styles.statusValue, { color: statusInfo.color }]}>
                  {statusInfo.status}
                </Text>
              </View>
            </View>

            {!userLocation && !locationError && (
              <Surface style={styles.infoSurface}>
                <MaterialCommunityIcons name="map-marker-question" size={20} color="#2196F3" />
                <Text style={styles.infoMessage}>
                  Location access required to verify attendance. Tap "Enable Location" below to continue.
                </Text>
              </Surface>
            )}

            {distance !== null && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Distance from Session</Text>
                <Text style={styles.distanceValue}>
                  {locationService.formatDistance(distance)}
                </Text>
                <ProgressBar
                  progress={distance !== null && session?.radiusMeters ? 
                    Math.max(0, Math.min(1, 1 - (distance / (session.radiusMeters * 2)))) : 0}
                  color={statusInfo.color}
                  style={styles.progressBar}
                />
              </View>
            )}

            {locationError && (
              <Surface style={styles.errorSurface}>
                <MaterialCommunityIcons name="alert" size={20} color="#F44336" />
                <Text style={styles.errorMessage}>{locationError}</Text>
              </Surface>
            )}

            <View style={styles.refreshContainer}>
              <Text style={styles.refreshText}>
                Auto-refresh in {countdown}s
              </Text>
              <Button
                mode="text"
                onPress={getCurrentLocation}
                icon="refresh"
              >
                Refresh Now
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.locationContainer}>
          <Card style={styles.locationCard}>
            <Card.Content>
              <View style={styles.locationHeader}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#667eea" />
                <Title style={styles.locationTitle}>Location Status</Title>
              </View>
              
              <View style={styles.locationInfo}>
                <View style={styles.locationItem}>
                  <MaterialCommunityIcons name="school" size={20} color="#666" />
                  <Text style={styles.locationText}>Session: {session.name}</Text>
                </View>
                
                {userLocation && (
                  <View style={styles.locationItem}>
                    <MaterialCommunityIcons name="account-lock" size={20} color="#666" />
                    <Text style={styles.locationText}>
                      Your Position: {userLocation.coords.latitude.toFixed(6)}, {userLocation.coords.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
                
                {distance !== null && (
                  <View style={styles.locationItem}>
                    <MaterialCommunityIcons 
                      name={canMark ? "check-circle" : "alert-circle"} 
                      size={20} 
                      color={canMark ? "#4CAF50" : "#FF9800"} 
                    />
                    <Text style={[
                      styles.locationText,
                      { color: canMark ? "#4CAF50" : "#FF9800" }
                    ]}>
                      Distance: {distance !== null ? distance.toFixed(0) : 'N/A'}m (Required: ≤{session.radiusMeters}m)
                    </Text>
                  </View>
                )}
                
                {userLocation?.coords.accuracy && (
                  <View style={styles.locationItem}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#666" />
                    <Text style={styles.locationText}>
                      GPS Accuracy: ±{Math.round(userLocation.coords.accuracy)}m
                    </Text>
                  </View>
                )}
              </View>
              
              <Surface style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: canMark ? "#4CAF50" : "#FF9800" }
                ]} />
                <Text style={[
                  styles.locationStatusText,
                  { color: canMark ? "#4CAF50" : "#FF9800" }
                ]}>
                  {canMark ? "You can mark attendance" : "Move closer to session location"}
                </Text>
              </Surface>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleMarkAttendance}
            disabled={loading}
            style={[
              styles.markButton,
              { backgroundColor: (!userLocation || (userLocation && canMark)) ? '#4CAF50' : '#999' }
            ]}
            contentStyle={styles.markButtonContent}
            icon={!userLocation ? "map-marker" : "check-circle"}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : !userLocation ? (
              'Enable Location & Mark Attendance'
            ) : canMark ? (
              'Mark Attendance'
            ) : (
              `Move ${locationService.formatDistance(Math.max(0, (distance || 0) - session.radiusMeters))} closer`
            )}
          </Button>

          <Button
            mode="outlined"
            onPress={() => {
              if (isMountedRef.current) {
                navigation.navigate('AttendanceHistory');
              }
            }}
            style={styles.cancelButton}
            icon="arrow-left"
          >
            Back to Sessions
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusLabel: {
    color: '#666',
    fontSize: 14,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  distanceContainer: {
    marginBottom: 20,
  },
  distanceLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  errorSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginVertical: 12,
  },
  errorMessage: {
    marginLeft: 8,
    color: '#F44336',
    flex: 1,
  },
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  refreshText: {
    color: '#666',
    fontSize: 14,
  },
  locationContainer: {
    margin: 16,
  },
  locationCard: {
    borderRadius: 16,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  locationStatusText: {
    fontSize: 14,
    fontWeight: '500',
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
  cancelButton: {
    marginTop: 12,
    borderRadius: 30,
    borderColor: '#667eea',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  infoSurface: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoMessage: {
    marginLeft: 12,
    flex: 1,
    color: '#1976D2',
    fontSize: 14,
  },
});
