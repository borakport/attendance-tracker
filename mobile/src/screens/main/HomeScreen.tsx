import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Surface,
  Avatar,
  Badge,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchActiveSessions } from '@/store/slices/sessionSlice';
import socketService from '@/services/socket.service';
import { UserRole } from '@/types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.course);
  const { activeSessions, loading } = useAppSelector((state) => state.session);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    connectSocket();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourses()).unwrap(),
        dispatch(fetchActiveSessions()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const connectSocket = async () => {
    const connected = await socketService.connect();
    if (connected) {
      console.log('Socket connected from HomeScreen');
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
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Title style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Title>
          </View>
          <Avatar.Icon
            size={50}
            icon="account"
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Surface style={styles.actionCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Attendance', { screen: 'ActiveSessions' })}
            >
              <MaterialCommunityIcons name="map-marker-check" size={32} color="#667eea" />
              <Text style={styles.actionText}>Mark{'\n'}Attendance</Text>
            </TouchableOpacity>
          </Surface>

          <Surface style={styles.actionCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Courses', { screen: 'JoinCourse' })}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={32} color="#667eea" />
              <Text style={styles.actionText}>Join{'\n'}Course</Text>
            </TouchableOpacity>
          </Surface>

          <Surface style={styles.actionCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialCommunityIcons name="chart-line" size={32} color="#667eea" />
              <Text style={styles.actionText}>View{'\n'}Stats</Text>
            </TouchableOpacity>
          </Surface>
        </View>

        {/* Active Sessions */}
        <Card style={styles.card}>
          <Card.Title
            title="Active Sessions"
            subtitle={`${activeSessions.length} session${activeSessions.length !== 1 ? 's' : ''} ongoing`}
            left={(props) => <Avatar.Icon {...props} icon="broadcast" />}
          />
          <Card.Content>
            {loading ? (
              <ActivityIndicator />
            ) : activeSessions.length > 0 ? (
              activeSessions.slice(0, 3).map((session) => (
                <Surface key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionTime}>
                      {format(new Date(session.startTime), 'h:mm a')}
                    </Text>
                  </View>
                  
                  {/* Check if user is the course owner/instructor */}
                  {user?.role === UserRole.INSTRUCTOR ? (
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => {
                        // Navigate to course detail to manage session
                        navigation.navigate('Courses', {
                          screen: 'CourseDetail',
                          params: { courseId: session.courseId }
                        });
                      }}
                    >
                      Manage
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
              ))
            ) : (
              <Text style={styles.emptyText}>No active sessions</Text>
            )}
          </Card.Content>
        </Card>

        {/* My Courses */}
        <Card style={styles.card}>
          <Card.Title
            title="My Courses"
            subtitle={`${courses.length} enrolled`}
            left={(props) => <Avatar.Icon {...props} icon="school" />}
            right={() => (
              <Button onPress={() => navigation.navigate('Courses')}>
                View All
              </Button>
            )}
          />
          <Card.Content>
            {courses.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courses.map((course) => (
                  <Surface key={course.id} style={styles.courseCard}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseCode}>{course.code}</Text>
                    <Badge>Enrolled</Badge>
                  </Surface>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No courses enrolled</Text>
            )}
          </Card.Content>
        </Card>

        {/* Stats Overview */}
        <Card style={styles.card}>
          <Card.Title
            title="This Week"
            left={(props) => <Avatar.Icon {...props} icon="chart-arc" />}
          />
          <Card.Content>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>87.5%</Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    elevation: 3,
    alignItems: 'center',
  },
  actionText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 3,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionTime: {
    color: '#666',
    marginTop: 4,
  },
  courseCard: {
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    minWidth: 150,
    elevation: 2,
  },
  courseName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  courseCode: {
    color: '#666',
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});
