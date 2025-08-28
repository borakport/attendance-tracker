import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Avatar,
  Chip,
  List,
  Surface,
  ActivityIndicator,
  FAB,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import { Course, Session, UserRole, CourseRole } from '@/types';
import { format } from 'date-fns';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCourseData();
    // Join course room for real-time updates
    socketService.joinCourse(courseId);

    return () => {
      socketService.leaveCourse(courseId);
    };
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      // Get course details
      const courseResponse = await apiService.getCourse(courseId);
      setCourse(courseResponse.data || null);
      
      // Get course sessions using the correct endpoint
      try {
        const sessionsResponse = await apiService.getSessions(courseId);
        setSessions(sessionsResponse.data || []);
      } catch (sessionError) {
        console.log('No sessions found for course');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load course details',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourseData();
    setRefreshing(false);
  };

  const handleLeaveCourse = () => {
    Alert.alert(
      'Leave Course',
      'Are you sure you want to leave this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.leaveCourse(courseId);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'You have left the course',
              });
              navigation.goBack();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to leave course',
              });
            }
          },
        },
      ]
    );
  };

  const getActiveSessions = () => {
    return sessions.filter(session => {
      const now = new Date();
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      return now >= startTime && now <= endTime && session.isActive;
    });
  };

  const getUpcomingSessions = () => {
    return sessions.filter(session => {
      const now = new Date();
      const startTime = new Date(session.startTime);
      return startTime > now;
    }).slice(0, 5);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = course.ownerId === user?.id;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const activeSessions = getActiveSessions();
  const upcomingSessions = getUpcomingSessions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Avatar.Text
              size={80}
              label={course.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
            <Title style={styles.courseTitle}>{course.name}</Title>
            <Text style={styles.courseCode}>Code: {course.code}</Text>
            <View style={styles.badges}>
              <Chip style={styles.roleBadge}>
                {isOwner ? 'Owner' : 'Member'}
              </Chip>
              {course.isActive && (
                <Chip style={styles.activeBadge}>Active</Chip>
              )}
            </View>
          </View>
        </LinearGradient>

        {course.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{course.description}</Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Course Information</Text>
            <List.Item
              title="Duration"
              description={`${format(new Date(course.startDate), 'MMM dd, yyyy')} - ${format(new Date(course.endDate), 'MMM dd, yyyy')}`}
              left={props => <List.Icon {...props} icon="calendar-range" />}
            />
            <Divider />
            <List.Item
              title="Members"
              description="View enrolled students"
              left={props => <List.Icon {...props} icon="account-group" />}
            />
            <Divider />
            <List.Item
              title="Total Sessions"
              description={`${sessions.length} sessions`}
              left={props => <List.Icon {...props} icon="broadcast" />}
            />
          </Card.Content>
        </Card>

        {activeSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Title
              title="Active Sessions"
              subtitle={`${activeSessions.length} ongoing`}
              left={(props) => <Avatar.Icon {...props} icon="broadcast" style={styles.iconActive} />}
            />
            <Card.Content>
              {activeSessions.map((session) => (
                <Surface key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionTime}>
                      Ends at {format(new Date(session.endTime), 'h:mm a')}
                    </Text>
                  </View>
                  
                  {/* Role-based actions */}
                  {isOwner ? (
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => {
                        Alert.alert(
                          'End Session',
                          `End "${session.name}" now?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'End',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await apiService.endSession(session.id);
                                  Toast.show({
                                    type: 'success',
                                    text1: 'Session Ended',
                                    text2: session.name,
                                  });
                                  onRefresh();
                                } catch (error) {
                                  Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: 'Failed to end session',
                                  });
                                }
                              },
                            },
                          ]
                        );
                      }}
                      style={{ borderColor: '#F44336' }}
                      textColor="#F44336"
                    >
                      End
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => navigation.navigate('Attendance', {
                        screen: 'MarkAttendance',
                        params: { sessionId: session.id }
                      })}
                    >
                      Mark
                    </Button>
                  )}
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {upcomingSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Title
              title="Upcoming Sessions"
              subtitle="Next 5 sessions"
              left={(props) => <Avatar.Icon {...props} icon="calendar-clock" />}
            />
            <Card.Content>
              {upcomingSessions.map((session) => (
                <List.Item
                  key={session.id}
                  title={session.name}
                  description={format(new Date(session.startTime), 'MMM dd, h:mm a')}
                  left={props => <List.Icon {...props} icon="clock-outline" />}
                  onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Title
            title="Settings"
            left={(props) => <Avatar.Icon {...props} icon="cog" />}
          />
          <Card.Content>
            <List.Item
              title="GPS Radius"
              description={`${course.settings?.gpsRadius || 50}m`}
              left={props => <List.Icon {...props} icon="map-marker-radius" />}
            />
            <Divider />
            <List.Item
              title="Late Entry"
              description={course.settings?.allowLateEntry ? 
                `Allowed (${course.settings.lateEntryMinutes} minutes)` : 
                'Not allowed'}
              left={props => <List.Icon {...props} icon="clock-alert" />}
            />
            <Divider />
            <List.Item
              title="Selfie Required"
              description={course.settings?.requireSelfie ? 'Yes' : 'No'}
              left={props => <List.Icon {...props} icon="camera" />}
            />
          </Card.Content>
        </Card>

        {!isOwner && (
          <View style={styles.actionContainer}>
            <Button
              mode="outlined"
              onPress={handleLeaveCourse}
              style={styles.leaveButton}
              icon="exit-to-app"
            >
              Leave Course
            </Button>
          </View>
        )}
      </ScrollView>

      {isOwner && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateSession', { courseId })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#F44336',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  courseTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  courseCode: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 8,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  iconActive: {
    backgroundColor: '#4CAF50',
  },
  actionContainer: {
    padding: 16,
  },
  leaveButton: {
    borderColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
});
