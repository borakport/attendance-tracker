import { NavigatorScreenParams } from '@react-navigation/native';

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
  Courses: NavigatorScreenParams<CourseStackParamList> | undefined;
  Attendance: NavigatorScreenParams<AttendanceStackParamList> | undefined;
  Profile: undefined;
};

export type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
  EditCourse: { course: any };
  CourseSettings: { course: any };
  JoinCourse: undefined;
  SessionList: { courseId: string };
  SessionDetail: { sessionId: string };
  CreateSession: { courseId: string };
  CourseMembers: { courseId: string; courseName: string };
};

export type AttendanceStackParamList = {
  ActiveSessions: undefined;
  MarkAttendance: { sessionId: string };
  AttendanceHistory: undefined;
  AttendanceStats: undefined;
};
