export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Attendance: undefined;
  Profile: undefined;
};

export type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
  JoinCourse: undefined;
  SessionList: { courseId: string };
  SessionDetail: { sessionId: string };
  CreateSession: { courseId: string };
};

export type AttendanceStackParamList = {
  ActiveSessions: undefined;
  MarkAttendance: { sessionId: string };
  AttendanceHistory: undefined;
  AttendanceStats: undefined;
};
