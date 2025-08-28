import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Config } from '@/constants/config';

const LOCATION_TASK_NAME = 'gps-attendance-location-task';

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentLocation: Location.LocationObject | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status: foregroundStatus } = 
      await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }

    const { status: backgroundStatus } = 
      await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('Background location permission denied');
      // Still return true as foreground is enough for basic functionality
    }

    return true;
  }

  async getCurrentLocation(): Promise<Location.LocationObject> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: Config.GPS.TIMEOUT,
      mayShowUserSettingsDialog: true,
    });

    this.currentLocation = location;
    return location;
  }

  async startLocationTracking(callback: (location: Location.LocationObject) => void) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: Config.GPS.DISTANCE_FILTER,
      },
      (location) => {
        this.currentLocation = location;
        callback(location);
      }
    );
  }

  stopLocationTracking() {
    this.locationSubscription?.remove();
    this.locationSubscription = null;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

  getLastLocation(): Location.LocationObject | null {
    return this.currentLocation;
  }
}

export default new LocationService();
