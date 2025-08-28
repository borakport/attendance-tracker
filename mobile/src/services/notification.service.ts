import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Config } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;
  private pushToken: string | null = null;

  async initialize(): Promise<void> {
    if (!Config.FEATURES.NOTIFICATIONS) return;

    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Get push token
    await this.registerForPushNotifications();

    // Set up listeners
    this.setupListeners();
  }

  private async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return false;
    }

    return true;
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      });
      
      this.pushToken = token.data;
      console.log('📱 Push token:', this.pushToken);
      
      // Save token for later use
      await AsyncStorage.setItem('@push_token', this.pushToken);
      
      // Send token to backend
      // await apiService.updatePushToken(this.pushToken);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    // Android specific channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('attendance', {
        name: 'Attendance',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500],
        lightColor: '#667eea',
        sound: 'default',
      });
    }
  }

  private setupListeners(): void {
    // Handle notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('📬 Notification received:', notification);
      }
    );

    // Handle notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('📬 Notification tapped:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification } = response;
    const data = notification.request.content.data;

    // Navigate based on notification type
    if (data?.type === 'session_started') {
      // Navigate to session screen
      console.log('Navigate to session:', data.sessionId);
    } else if (data?.type === 'attendance_reminder') {
      // Navigate to attendance screen
      console.log('Navigate to attendance');
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: trigger || null, // null = immediate
    });

    return id;
  }

  async sendSessionReminder(
    sessionName: string,
    startTime: Date
  ): Promise<void> {
    const reminderTime = new Date(startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 10); // 10 min before

    if (reminderTime > new Date()) {
      await this.scheduleLocalNotification(
        'Session Starting Soon',
        `${sessionName} starts in 10 minutes`,
        { type: 'session_reminder' },
        { date: reminderTime }
      );
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }
}

export default new NotificationService();
