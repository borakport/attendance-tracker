import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Badge } from 'react-native-paper';
import { View } from 'react-native';
import { useAppSelector } from '@/hooks/redux';
import { UserRole } from '@/types';

// Import screens
import HomeScreen from '@/screens/main/HomeScreen';
import CourseListScreen from '@/screens/course/CourseListScreen';
import CourseDetailScreen from '@/screens/course/CourseDetailScreen';
import SessionsListScreen from '@/screens/course/SessionsListScreen';
import CourseMembersScreen from '@/screens/course/CourseMembersScreen';
import SessionDetailScreen from '@/screens/session/SessionDetailScreen';
import JoinCourseScreen from '@/screens/course/JoinCourseScreen';
import CreateCourseScreen from '@/screens/course/CreateCourseScreen';
import CreateSessionScreen from '@/screens/session/CreateSessionScreen';
import MarkAttendanceScreen from '@/screens/attendance/MarkAttendanceScreen';
import AttendanceScreen from '@/screens/attendance/AttendanceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Course Stack Navigator
function CourseStack() {
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CourseList" 
        component={CourseListScreen}
        options={{ title: 'My Courses' }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{ title: 'Course Details' }}
      />
      <Stack.Screen 
        name="SessionsList" 
        component={SessionsListScreen}
        options={{ title: 'Sessions' }}
      />
      <Stack.Screen 
        name="CourseMembers" 
        component={CourseMembersScreen}
        options={{ title: 'Course Members' }}
      />
      <Stack.Screen 
        name="SessionDetail" 
        component={SessionDetailScreen}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen 
        name="JoinCourse" 
        component={JoinCourseScreen}
        options={{ title: 'Join Course' }}
      />
      {user?.role === UserRole.INSTRUCTOR && (
        <>
          <Stack.Screen 
            name="CreateCourse" 
            component={CreateCourseScreen}
            options={{ title: 'Create Course' }}
          />
          <Stack.Screen 
            name="CreateSession" 
            component={CreateSessionScreen}
            options={{ title: 'Create Session' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Attendance Stack Navigator
function AttendanceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AttendanceHistory" 
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <Stack.Screen 
        name="MarkAttendance" 
        component={MarkAttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const isStudent = user?.role === UserRole.STUDENT;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: 'white',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CourseStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" color={color} size={size} />
          ),
        }}
      />
      {isStudent && (
        <Tab.Screen
          name="Attendance"
          component={AttendanceStack}
          options={{
            headerShown: false,
            tabBarLabel: 'Sessions',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
