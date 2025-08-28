import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  isBottomSheetOpen: boolean;
  isLocationTracking: boolean;
  isSocketConnected: boolean;
  notifications: Notification[];
  selectedCourseId: string | null;
  selectedSessionId: string | null;
  currentScreen: string;
  loading: {
    global: boolean;
    attendance: boolean;
    location: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const initialState: UIState = {
  theme: 'auto',
  isBottomSheetOpen: false,
  isLocationTracking: false,
  isSocketConnected: false,
  notifications: [],
  selectedCourseId: null,
  selectedSessionId: null,
  currentScreen: 'Dashboard',
  loading: {
    global: false,
    attendance: false,
    location: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    
    setBottomSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.isBottomSheetOpen = action.payload;
    },
    
    setLocationTracking: (state, action: PayloadAction<boolean>) => {
      state.isLocationTracking = action.payload;
    },
    
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    setSelectedCourse: (state, action: PayloadAction<string | null>) => {
      state.selectedCourseId = action.payload;
    },
    
    setSelectedSession: (state, action: PayloadAction<string | null>) => {
      state.selectedSessionId = action.payload;
    },
    
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setAttendanceLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.attendance = action.payload;
    },
    
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.location = action.payload;
    },
    
    resetUI: (state) => {
      state.isBottomSheetOpen = false;
      state.selectedCourseId = null;
      state.selectedSessionId = null;
      state.notifications = [];
      state.loading = {
        global: false,
        attendance: false,
        location: false,
      };
    },
  },
});

export const {
  setTheme,
  setBottomSheetOpen,
  setLocationTracking,
  setSocketConnected,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  setSelectedCourse,
  setSelectedSession,
  setCurrentScreen,
  setGlobalLoading,
  setAttendanceLoading,
  setLocationLoading,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
