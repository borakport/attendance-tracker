import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { Config } from '@/constants/config';
import Toast from 'react-native-toast-message';

const LOCATION_TASK_NAME = 'gps-attendance-background-location';

interface LocationUpdateCallback {
  (location: Location.LocationObject): void;
}

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentLocation: Location.LocationObject | null = null;
  private updateCallbacks: Set<LocationUpdateCallback> = new Set();
  private watchId: number | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permissions first
      const { status: foregroundStatus } = 
        await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Location Permission Denied',
          text2: 'Please enable location permissions in settings',
        });
        return false;
      }

      // Request background permissions for Android
      if (Platform.OS === 'android' && Config.FEATURES.BACKGROUND_LOCATION) {
        const { status: backgroundStatus } = 
          await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied');
          // Still return true as foreground is enough
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Config.GPS.HIGH_ACCURACY 
          ? Location.Accuracy.BestForNavigation 
          : Location.Accuracy.Balanced,
        timeInterval: Config.GPS.TIMEOUT,
        mayShowUserSettingsDialog: true,
      });

      console.log('📍 Got current location:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        latType: typeof location.coords.latitude,
        lonType: typeof location.coords.longitude
      });

      this.currentLocation = location;
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Could not get your current location',
      });
      return null;
    }
  }

  async startLocationTracking(callback?: LocationUpdateCallback): Promise<boolean> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return false;
      }

      if (callback) {
        this.updateCallbacks.add(callback);
      }

      // Stop any existing subscription
      await this.stopLocationTracking();

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: Config.GPS.DISTANCE_FILTER,
        },
        (location) => {
          this.currentLocation = location;
          this.notifyCallbacks(location);
        }
      );

      console.log('📍 Location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationSubscription) {
      await this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.updateCallbacks.clear();
    console.log('📍 Location tracking stopped');
  }

  private notifyCallbacks(location: Location.LocationObject) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  async startBackgroundLocationTask(): Promise<void> {
    if (!Config.FEATURES.BACKGROUND_LOCATION) return;

    const { status } = await Location.getBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Background location permission not granted');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // Update every minute
      distanceInterval: 50, // or every 50 meters
      foregroundService: {
        notificationTitle: 'GPS Attendance',
        notificationBody: 'Tracking your location for attendance',
        notificationColor: '#667eea',
      },
    });
  }

  async stopBackgroundLocationTask(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Validate inputs
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null ||
        isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      console.warn('Invalid coordinates provided to calculateDistance:', { lat1, lon1, lat2, lon2 });
      return NaN;
    }
    
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * 
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * 
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance); // Return distance in meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= radiusMeters;
  }

  formatDistance(meters: number): string {
    // Handle invalid inputs
    if (meters == null || isNaN(meters) || !isFinite(meters)) {
      return 'N/A';
    }
    
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  }

  getLastLocation(): Location.LocationObject | null {
    return this.currentLocation;
  }

  async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<string | null> {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (address) {
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

// Register background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as any;
    if (locations && locations.length > 0) {
      const location = locations[0];
      console.log('📍 Background location update:', location);
      // Here you could send location to server or store locally
    }
  }
});

export default new LocationService();
