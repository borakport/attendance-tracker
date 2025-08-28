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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
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
  const { loading } = useAppSelector((state) => state.attendance);
  const { user } = useAppSelector((state) => state.auth);
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canMark, setCanMark] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    loadSession();
    startLocationTracking();
    
    return () => {
      // Cleanup location tracking
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
      const response = await apiService.getSession(sessionId);
      if (response.data) {
        setSession(response.data);
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
              if (!userLocation) return;
              
              await dispatch(markAttendance({
                sessionId,
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              })).unwrap();
              
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
    if (!distance) return { color: '#999', status: 'Calculating...' };
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
                {format(new Date(session.startTime), 'h:mm a')}
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
              <View style={styles.statusText}>
                <Text style={styles.statusLabel}>Your Status</Text>
                <Text style={[styles.statusValue, { color: statusInfo.color }]}>
                  {statusInfo.status}
                </Text>
              </View>
            </View>

            {distance !== null && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Distance from Session</Text>
                <Text style={styles.distanceValue}>
                  {locationService.formatDistance(distance)}
                </Text>
                <ProgressBar
                  progress={Math.max(0, 1 - (distance / (session.radiusMeters * 2)))}
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

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: session.latitude,
              longitude: session.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{
                latitude: session.latitude,
                longitude: session.longitude,
              }}
              title={session.name}
              description="Session Location"
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons name="school" size={30} color="#667eea" />
              </View>
            </Marker>
            
            <Circle
              center={{
                latitude: session.latitude,
                longitude: session.longitude,
              }}
              radius={session.radiusMeters}
              strokeColor="rgba(102, 126, 234, 0.5)"
              fillColor="rgba(102, 126, 234, 0.1)"
              strokeWidth={2}
            />

            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                }}
                title="Your Location"
                description={`Accuracy: ${Math.round(userLocation.coords.accuracy || 0)}m`}
              >
                <View style={styles.userMarker}>
                  <MaterialCommunityIcons name="account" size={24} color="white" />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleMarkAttendance}
            disabled={!canMark || loading}
            style={[
              styles.markButton,
              { backgroundColor: canMark ? '#4CAF50' : '#999' }
            ]}
            contentStyle={styles.markButtonContent}
            icon="check-circle"
          >
            {loading ? (
              <ActivityIndicator color="white" />
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
  locationCard: {
    margin: 16,
    borderRadius: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
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
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },
  userMarker: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 20,
    elevation: 5,
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
