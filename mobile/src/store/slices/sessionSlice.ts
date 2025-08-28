import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session } from '@/types';
import apiService from '@/services/api.service';

// State type
interface SessionState {
  sessions: Session[];
  activeSessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SessionState = {
  sessions: [],
  activeSessions: [],
  currentSession: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSessions = createAsyncThunk(
  'session/fetchSessions',
  async (courseId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getSessions(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sessions');
    }
  }
);

export const fetchActiveSessions = createAsyncThunk(
  'session/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getActiveSessions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch active sessions');
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  'session/fetchSessionById',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getSession(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch session');
    }
  }
);

export const createSession = createAsyncThunk(
  'session/createSession',
  async (sessionData: Partial<Session>, { rejectWithValue }) => {
    try {
      const response = await apiService.createSession(sessionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create session');
    }
  }
);

export const startSession = createAsyncThunk(
  'session/startSession',
  async (
    { sessionId, location }: { sessionId: string; location?: { latitude: number; longitude: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.startSession(sessionId, location);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start session');
    }
  }
);

export const endSession = createAsyncThunk(
  'session/endSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.endSession(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to end session');
    }
  }
);

// Slice
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action: PayloadAction<Session | null>) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    resetSessionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sessions = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch active sessions
      .addCase(fetchActiveSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.activeSessions = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch session by ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentSession = action.payload;
          const index = state.sessions.findIndex(session => session.id === action.payload!.id);
          if (index !== -1) {
            state.sessions[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.sessions.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start session
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Update session in sessions array
          const sessionIndex = state.sessions.findIndex(session => session.id === action.payload!.id);
          if (sessionIndex !== -1) {
            state.sessions[sessionIndex] = action.payload;
          }
          
          // Add to active sessions if not already there
          const activeIndex = state.activeSessions.findIndex(session => session.id === action.payload!.id);
          if (activeIndex === -1) {
            state.activeSessions.push(action.payload);
          } else {
            state.activeSessions[activeIndex] = action.payload;
          }
          
          // Update current session if it's the same
          if (state.currentSession?.id === action.payload.id) {
            state.currentSession = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // End session
      .addCase(endSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Update session in sessions array
          const sessionIndex = state.sessions.findIndex(session => session.id === action.payload!.id);
          if (sessionIndex !== -1) {
            state.sessions[sessionIndex] = action.payload;
          }
          
          // Remove from active sessions
          state.activeSessions = state.activeSessions.filter(session => session.id !== action.payload!.id);
          
          // Update current session if it's the same
          if (state.currentSession?.id === action.payload.id) {
            state.currentSession = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentSession, clearCurrentSession, resetSessionState } = sessionSlice.actions;
export default sessionSlice.reducer;
