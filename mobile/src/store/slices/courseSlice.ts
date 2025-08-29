import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '@/types';
import apiService from '@/services/api.service';

// State type
interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching user courses...');
      const response = await apiService.getMyCourses();
      console.log('Raw courses response:', response.data);
      
      // Transform courses to include role at root level
      const transformedCourses = response.data?.map((course: any) => ({
        ...course,
        role: course.members?.[0]?.role || 'PARTICIPANT',
        memberCount: course._count?.members || 0,
        sessionCount: course._count?.sessions || 0,
      })) || [];
      
      console.log('Transformed courses:', transformedCourses);
      return transformedCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch courses');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'course/fetchCourseById',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCourse(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch course');
    }
  }
);

export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData: Partial<Course>, { rejectWithValue }) => {
    try {
      const response = await apiService.createCourse(courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create course');
    }
  }
);

export const joinCourse = createAsyncThunk(
  'course/joinCourse',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await apiService.joinCourse(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to join course');
    }
  }
);

export const leaveCourse = createAsyncThunk(
  'course/leaveCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await apiService.leaveCourse(courseId);
      return courseId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to leave course');
    }
  }
);

// Slice
const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    resetCourseState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.courses = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentCourse = action.payload;
          const index = state.courses.findIndex(course => course.id === action.payload!.id);
          if (index !== -1) {
            state.courses[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.courses.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Join course
      .addCase(joinCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const existingIndex = state.courses.findIndex(course => course.id === action.payload!.id);
          if (existingIndex === -1) {
            state.courses.push(action.payload);
          }
        }
        state.error = null;
      })
      .addCase(joinCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Leave course
      .addCase(leaveCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course.id !== action.payload);
        if (state.currentCourse?.id === action.payload) {
          state.currentCourse = null;
        }
        state.error = null;
      })
      .addCase(leaveCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentCourse, clearCurrentCourse, resetCourseState } = courseSlice.actions;
export default courseSlice.reducer;
