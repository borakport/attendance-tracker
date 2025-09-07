import React, { useEffect, useState } from 'react';
import { View, RefreshControl, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, Avatar, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchActiveSessions } from '@/store/slices/sessionSlice';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { UserRole } from '@/types';
import Toast from 'react-native-toast-message';

import { ColorPalette, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Layout, SpacingStyles, TypographyStyles } from '@/styles/utilities';
import { ModernScreen, ModernSection, ModernHeader, ModernEmptyState, ModernLoadingState, ModernScrollView } from '@/components/ui/ModernLayout';
import { ModernButton, ModernCard, ModernChip, ModernBadge } from '@/components/ui/ModernComponents';

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.course);
  const { activeSessions, loading } = useAppSelector((state) => state.session);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);

  const isStudent = user?.role === UserRole.STUDENT;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourses()),
        dispatch(fetchActiveSessions()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSessionStatus = (session: any) => {
    if (!session.startTime || !session.endTime) {
      return { status: 'Scheduled', color: theme.colors.primary, icon: 'clock-outline' };
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) {
      return { status: 'Upcoming', color: theme.colors.primary, icon: 'clock-outline' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Live', color: ColorPalette.success, icon: 'record-circle' };
    } else {
      return { status: 'Ended', color: theme.colors.outline, icon: 'check-circle' };
    }
  };

  const renderCourseCard = ({ item: course }: { item: any }) => {
    const courseActiveSessions = activeSessions.filter((s: any) => s.courseId === course.id);
    const liveSession = courseActiveSessions.find((s: any) => {
      const now = new Date();
      const startTime = new Date(s.startTime);
      const endTime = new Date(s.endTime);
      return now >= startTime && now <= endTime;
    });

    return (
      <ModernCard
        variant="elevated"
        padding="medium"
        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
        style={{
          marginHorizontal: Spacing.xs,
          marginVertical: Spacing.xs,
          minHeight: 160,
        }}
      >
        <View style={Layout.flex1}>
          <View style={[Layout.rowBetween, SpacingStyles.mbSm]}>
            <Avatar.Text
              size={48}
              label={course.code.slice(0, 2)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ color: theme.colors.onPrimaryContainer, fontSize: 16, fontWeight: '600' }}
            />
            {liveSession && (
              <ModernBadge variant="dot" color="success" size="small" />
            )}
          </View>
          
          <Text style={[
            TypographyStyles.titleMedium,
            { color: theme.colors.onSurface, fontWeight: '600' },
            SpacingStyles.mbXs
          ]} numberOfLines={2}>
            {course.name}
          </Text>
          
          <Text style={[
            TypographyStyles.labelMedium,
            { color: theme.colors.primary, fontWeight: '500' },
            SpacingStyles.mbSm
          ]}>
            {course.code}
          </Text>

          <View style={{ flex: 1 }} />

          <View style={[
            { 
              borderTopWidth: 1, 
              borderTopColor: theme.colors.outlineVariant,
              paddingTop: Spacing.sm,
            }
          ]}>
            <View style={[Layout.rowBetween, SpacingStyles.mbXs]}>
              <Text style={[TypographyStyles.labelSmall, { color: theme.colors.onSurfaceVariant }]}>
                Students
              </Text>
              <Text style={[TypographyStyles.labelSmall, { color: theme.colors.onSurface, fontWeight: '500' }]}>
                {course.enrollmentCount || 0}
              </Text>
            </View>
            {courseActiveSessions.length > 0 && (
              <View style={Layout.rowBetween}>
                <Text style={[TypographyStyles.labelSmall, { color: theme.colors.onSurfaceVariant }]}>
                  Active Sessions
                </Text>
                <Text style={[TypographyStyles.labelSmall, { color: theme.colors.onSurface, fontWeight: '500' }]}>
                  {courseActiveSessions.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ModernCard>
    );
  };

  const renderSessionCard = ({ item: session }: { item: any }) => {
    const status = getSessionStatus(session);
    const course = courses.find((c: any) => c.id === session.courseId);

    return (
      <ModernCard
        variant="outlined"
        padding="medium"
        onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
        style={SpacingStyles.mbMd}
      >
        <View style={[Layout.rowBetween, SpacingStyles.mbSm]}>
          <View style={Layout.flex1}>
            <Text style={[
              TypographyStyles.titleSmall,
              { color: theme.colors.onSurface, fontWeight: '600' }
            ]} numberOfLines={1}>
              {course?.name || 'Unknown Course'}
            </Text>
            <Text style={[
              TypographyStyles.bodySmall,
              { color: theme.colors.onSurfaceVariant },
              SpacingStyles.mtXs
            ]}>
              {course?.code} • {format(new Date(session.startTime), 'MMM d, h:mm a')}
            </Text>
          </View>
          
          <ModernChip
            label={status.status}
            variant="filled"
            color={status.status === 'Live' ? 'success' : 'primary'}
            size="small"
            icon={status.icon}
          />
        </View>

        {session.location && (
          <View style={[Layout.rowCenter, SpacingStyles.mtSm]}>
            <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[
              TypographyStyles.bodySmall,
              { color: theme.colors.onSurfaceVariant },
              SpacingStyles.mlXs
            ]}>
              {session.location}
            </Text>
          </View>
        )}
      </ModernCard>
    );
  };

  const quickActions = [
    {
      title: isInstructor ? 'Create Session' : 'Join Session',
      subtitle: isInstructor ? 'Start new session' : 'Enter session code',
      icon: isInstructor ? 'plus-circle' : 'qrcode-scan',
      color: ColorPalette.primary,
      onPress: () => navigation.navigate(isInstructor ? 'CreateSession' : 'JoinSession'),
    },
    {
      title: 'My Courses',
      subtitle: 'View all courses',
      icon: 'book-multiple',
      color: ColorPalette.secondary,
      onPress: () => navigation.navigate('Courses'),
    },
    {
      title: 'Attendance',
      subtitle: 'View records',
      icon: 'chart-line',
      color: ColorPalette.accent,
      onPress: () => navigation.navigate('Attendance'),
    },
  ];

  if (loading && !courses.length) {
    return (
      <ModernScreen>
        <ModernLoadingState message="Loading your dashboard..." />
      </ModernScreen>
    );
  }

  return (
    <ModernScreen padding={false}>
      <ModernHeader
        title={`${getGreeting()}, ${user?.firstName || 'User'}!`}
        subtitle="Welcome back to Smart Attendance"
        variant="large"
        rightAction={{
          icon: 'account-circle',
          onPress: () => navigation.navigate('Profile'),
        }}
        style={{
          backgroundColor: theme.colors.primaryContainer,
        }}
      />

      <ModernScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        padding={true}
      >
        {/* Quick Actions */}
        <ModernSection title="Quick Actions" spacing="medium">
          <View style={[Layout.flexRow, { flexWrap: 'wrap', marginHorizontal: -Spacing.xs }]}>
            {quickActions.map((action, index) => (
              <View key={index} style={{ width: '50%', padding: Spacing.xs }}>
                <ModernCard
                  variant="filled"
                  padding="medium"
                  onPress={action.onPress}
                  style={{ minHeight: 100 }}
                >
                  <View style={[Layout.centerAll, Layout.flex1]}>
                    <Icon name={action.icon as any} size={32} color={action.color} style={SpacingStyles.mbSm} />
                    <Text style={[
                      TypographyStyles.labelLarge,
                      { color: theme.colors.onSurface, fontWeight: '600', textAlign: 'center' }
                    ]}>
                      {action.title}
                    </Text>
                    <Text style={[
                      TypographyStyles.bodySmall,
                      { color: theme.colors.onSurfaceVariant, textAlign: 'center' },
                      SpacingStyles.mtXs
                    ]}>
                      {action.subtitle}
                    </Text>
                  </View>
                </ModernCard>
              </View>
            ))}
          </View>
        </ModernSection>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <ModernSection 
            title="Active Sessions" 
            subtitle={`${activeSessions.length} session${activeSessions.length > 1 ? 's' : ''} running`}
            action={{
              label: 'View All',
              onPress: () => navigation.navigate('Sessions'),
            }}
            spacing="medium"
          >
            <FlatList
              data={activeSessions.slice(0, 3)}
              renderItem={renderSessionCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </ModernSection>
        )}

        {/* My Courses */}
        <ModernSection 
          title="My Courses" 
          subtitle={`${courses.length} course${courses.length > 1 ? 's' : ''}`}
          action={{
            label: 'View All',
            onPress: () => navigation.navigate('Courses'),
          }}
          spacing="medium"
        >
          {courses.length > 0 ? (
            <FlatList
              data={courses.slice(0, 6)}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          ) : (
            <ModernEmptyState
              icon="book-outline"
              title="No Courses"
              subtitle={
                isInstructor 
                  ? "You haven't created any courses yet. Get started by creating your first course."
                  : "You're not enrolled in any courses yet. Contact your instructor to get enrolled."
              }
              action={{
                label: isInstructor ? 'Create Course' : 'Join Course',
                onPress: () => navigation.navigate(isInstructor ? 'CreateCourse' : 'JoinCourse'),
              }}
            />
          )}
        </ModernSection>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ModernScrollView>
    </ModernScreen>
  );
}
