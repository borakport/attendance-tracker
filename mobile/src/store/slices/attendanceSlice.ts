import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Attendance } from '@/types';
import apiService from '@/services/api.service';

// State type
interface AttendanceState {
  attendances: Attendance[];
  myAttendance: Attendance[];
  sessionAttendance: Attendance[];
  attendanceStats: any;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AttendanceState = {
  attendances: [],
  myAttendance: [],
  sessionAttendance: [],
  attendanceStats: null,
  loading: false,
  error: null,
};

// Async thunks
export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (
    data: {
      sessionId: string;
      latitude: number;
      longitude: number;
      selfieUrl?: string;
      deviceInfo?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.markAttendance(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark attendance');
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMyAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMyAttendance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch my attendance');
    }
  }
);

export const fetchSessionAttendance = createAsyncThunk(
  'attendance/fetchSessionAttendance',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getSessionAttendance(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch session attendance');
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (courseId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getAttendanceStats(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch attendance stats');
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAttendanceState: () => initialState,
    clearSessionAttendance: (state) => {
      state.sessionAttendance = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.attendances.push(action.payload);
          state.myAttendance.push(action.payload);
        }
        state.error = null;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.myAttendance = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch session attendance
      .addCase(fetchSessionAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionAttendance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sessionAttendance = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchSessionAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch attendance stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.attendanceStats = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetAttendanceState, clearSessionAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
