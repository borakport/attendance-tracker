import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Surface,
  Avatar,
  ActivityIndicator,
  IconButton,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCourses } from '@/store/slices/courseSlice';
import { fetchActiveSessions } from '@/store/slices/sessionSlice';
import socketService from '@/services/socket.service';
import apiService from '@/services/api.service';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { UserRole } from '@/types';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.course);
  const { activeSessions, loading } = useAppSelector((state) => state.session);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [sessionTimers, setSessionTimers] = useState<any>({});
  const [liveAttendance, setLiveAttendance] = useState<any[]>([]);

  const isStudent = user?.role === UserRole.STUDENT;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    loadData();
    connectSocket();
    
    // Set up timer interval for countdown
    const interval = setInterval(updateSessionTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Subscribe to real-time attendance updates
    if (isInstructor && activeSessions.length > 0) {
      activeSessions.forEach(session => {
        // socketService.onAttendanceMarked would need to be implemented
        // For now, we'll simulate with a placeholder
        console.log('Setting up attendance listener for session:', session.id);
      });
    }
  }, [activeSessions, isInstructor]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourses()).unwrap(),
        dispatch(fetchActiveSessions()).unwrap(),
        isStudent ? loadWeeklyStats() : loadInstructorStats(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      // Use getMyAttendance instead of non-existing getAttendanceStats
      const response = await apiService.getMyAttendance();
      const attendanceList = response.data || [];
      
      // Calculate stats from attendance data
      const thisWeek = attendanceList.filter((a: any) => {
        const attendanceDate = new Date(a.markedAt);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return attendanceDate >= weekStart;
      });
      
      const stats = {
        classesThisWeek: thisWeek.length,
        attendanceRate: attendanceList.length > 0 ? 
          Math.round((attendanceList.filter((a: any) => a.status === 'PRESENT').length / attendanceList.length) * 100) : 0,
        totalClasses: attendanceList.length,
        coursesEnrolled: courses.length,
      };
      
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
      // Set default stats if API fails
      setWeeklyStats({
        classesThisWeek: 0,
        attendanceRate: 0,
        totalClasses: 0,
        coursesEnrolled: courses.length,
      });
    }
  };

  const loadInstructorStats = async () => {
    // Load instructor-specific stats
    try {
      const activeCourses = courses.filter(c => c.isActive).length;
      const totalStudents = courses.reduce((sum, c) => sum + ((c as any).memberCount || 0), 0);
      setWeeklyStats({
        activeCourses,
        totalStudents,
        todaySessions: activeSessions.length,
      });
    } catch (error) {
      console.error('Error loading instructor stats:', error);
    }
  };

  const connectSocket = async () => {
    const connected = await socketService.connect();
    if (connected) {
      console.log('Socket connected from HomeScreen');
      
      // Join all course rooms for real-time updates
      courses.forEach(course => {
        socketService.joinCourse(course.id);
      });
      
      // Monitor active sessions for real-time attendance updates
      activeSessions.forEach(session => {
        socketService.monitorSession(session.id);
      });
      
      // Set up real-time event listeners
      socketService.on('session:started', (data) => {
        console.log('Session started event received:', data);
        // Refresh active sessions
        dispatch(fetchActiveSessions());
        Toast.show({
          type: 'success',
          text1: 'Session Started',
          text2: data.sessionName || 'A session has started',
        });
      });

      socketService.on('session:ended', (data) => {
        console.log('Session ended event received:', data);
        // Refresh active sessions
        dispatch(fetchActiveSessions());
        Toast.show({
          type: 'info',
          text1: 'Session Ended',
          text2: data.sessionName || 'A session has ended',
        });
      });

      socketService.on('session:created', (data) => {
        console.log('Session created event received:', data);
        // Refresh active sessions
        dispatch(fetchActiveSessions());
        Toast.show({
          type: 'info',
          text1: 'New Session',
          text2: data.sessionName || 'A new session was created',
        });
      });

      socketService.on('attendance:marked', (data) => {
        console.log('Attendance marked event received:', data);
        // Refresh live attendance data
        setLiveAttendance(prev => [data, ...prev.slice(0, 4)]);
      });

      socketService.on('course:updated', (data) => {
        console.log('Course updated event received:', data);
        // Refresh courses
        dispatch(fetchCourses());
      });

      socketService.on('member:joined', (data) => {
        console.log('Member joined event received:', data);
        // Refresh courses
        dispatch(fetchCourses());
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const updateSessionTimers = () => {
    const now = new Date();
    const timers: any = {};
    
    activeSessions.forEach(session => {
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const lateTime = new Date(startTime.getTime() + (session.lateMinutes || 15) * 60000);
      
      if (now < startTime) {
        // Session hasn't started
        const minutesUntilStart = differenceInMinutes(startTime, now);
        const secondsUntilStart = differenceInSeconds(startTime, now) % 60;
        timers[session.id] = {
          status: 'upcoming',
          text: `Starts in ${minutesUntilStart}m ${secondsUntilStart}s`,
          color: '#2196F3',
        };
      } else if (now >= startTime && now <= lateTime) {
        // Within attendance marking time
        const minutesLeft = differenceInMinutes(lateTime, now);
        const secondsLeft = differenceInSeconds(lateTime, now) % 60;
        timers[session.id] = {
          status: 'active',
          text: `Attendance open: ${minutesLeft}m ${secondsLeft}s`,
          color: '#4CAF50',
          progress: 1 - ((now.getTime() - startTime.getTime()) / (lateTime.getTime() - startTime.getTime())),
        };
      } else if (now > lateTime && now < endTime) {
        // Late period ended, session still active
        const minutesUntilEnd = differenceInMinutes(endTime, now);
        const secondsUntilEnd = differenceInSeconds(endTime, now) % 60;
        timers[session.id] = {
          status: 'late',
          text: `Ends in ${minutesUntilEnd}m ${secondsUntilEnd}s`,
          color: '#FF9800',
          progress: 1 - ((now.getTime() - lateTime.getTime()) / (endTime.getTime() - lateTime.getTime())),
        };
      } else {
        // Session ended
        timers[session.id] = {
          status: 'ended',
          text: 'Session ended',
          color: '#F44336',
        };
      }
    });
    
    setSessionTimers(timers);
  };

  const handleEndSession = async (sessionId: string, sessionName: string) => {
    Alert.alert(
      'End Session',
      `Are you sure you want to end "${sessionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.endSession(sessionId);
              Toast.show({
                type: 'success',
                text1: 'Session Ended',
                text2: sessionName,
              });
              await loadData();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to end session',
                text2: 'Please try again',
              });
            }
          },
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Minimized Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerCompact}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
            <Avatar.Icon
              size={40}
              icon="account"
              style={styles.avatar}
            />
          </View>
        </LinearGradient>

        {isStudent && (
          <>
            {/* Student Content - Previous implementation */}
            <View style={styles.quickActions}>
              <Surface style={styles.actionCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Attendance', { 
                    screen: 'AttendanceList' 
                  })}
                >
                  <MaterialCommunityIcons name="calendar-check" size={28} color="#667eea" />
                  <Text style={styles.actionText}>View{'\n'}Sessions</Text>
                </TouchableOpacity>
              </Surface>

              <Surface style={styles.actionCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Courses', { 
                    screen: 'JoinCourse' 
                  })}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={28} color="#667eea" />
                  <Text style={styles.actionText}>Join{'\n'}Course</Text>
                </TouchableOpacity>
              </Surface>

              <Surface style={styles.actionCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                >
                  <MaterialCommunityIcons name="chart-line" size={28} color="#667eea" />
                  <Text style={styles.actionText}>View{'\n'}Stats</Text>
                </TouchableOpacity>
              </Surface>
            </View>

            {/* Active Sessions for Students */}
            {activeSessions.length > 0 && (
              <Card style={styles.card}>
                <Card.Title
                  title="Live Sessions"
                  subtitle="Sessions you can attend now"
                  left={(props) => <Avatar.Icon {...props} icon="broadcast" style={{ backgroundColor: '#4CAF50' }} />}
                />
                <Card.Content>
                  {activeSessions.map((session) => {
                    const timer = sessionTimers[session.id] || {};
                    const course = courses.find(c => c.id === session.courseId);
                    
                    return (
                      <Surface key={session.id} style={styles.activeSessionCard}>
                        <View style={styles.sessionHeader}>
                          <View style={styles.sessionMainInfo}>
                            <Text style={styles.sessionName}>{session.name}</Text>
                            <Text style={styles.courseName}>{course?.name}</Text>
                            <Text style={styles.courseName}>
                              Location: {(session as any).location || 'Not specified'}
                            </Text>
                          </View>
                          <Button
                            mode="contained"
                            compact
                            onPress={() => navigation.navigate('Attendance', {
                              screen: 'MarkAttendance',
                              params: { sessionId: session.id }
                            })}
                            style={{ backgroundColor: '#4CAF50' }}
                          >
                            Attend
                          </Button>
                        </View>
                        
                        <View style={styles.sessionInfo}>
                          <Text style={[styles.statLabel, { color: timer.color }]}>
                            {timer.text || 'Loading...'}
                          </Text>
                          {timer.progress && (
                            <ProgressBar 
                              progress={timer.progress} 
                              color={timer.color}
                              style={styles.progressBar}
                            />
                          )}
                          
                          <View style={styles.sessionInfo}>
                            <Text style={styles.courseName}>
                              📍 Radius: {(session as any).gpsRadius || 50}m
                            </Text>
                            <Text style={styles.courseName}>
                              ⏰ Late entry: {(session as any).allowLateEntry ? 
                                `${session.lateMinutes || 15}min` : 'Not allowed'}
                            </Text>
                            {(session as any).requireSelfie && (
                              <Text style={styles.courseName}>📸 Selfie required</Text>
                            )}
                          </View>
                        </View>
                      </Surface>
                    );
                  })}
                </Card.Content>
              </Card>
            )}

            {/* Student Weekly Stats */}
            {weeklyStats && (
              <Card style={styles.statsCard}>
                <Card.Title
                  title="This Week"
                  left={(props) => <Avatar.Icon {...props} icon="chart-box" />}
                />
                <Card.Content>
                  <View style={styles.instructorStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{weeklyStats.classesThisWeek || 0}</Text>
                      <Text style={styles.statLabel}>Classes Attended</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{weeklyStats.attendanceRate || 0}%</Text>
                      <Text style={styles.statLabel}>Attendance Rate</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{courses.length}</Text>
                      <Text style={styles.statLabel}>Enrolled Courses</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {isInstructor && (
          <>
            {/* Instructor Quick Stats */}
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={styles.instructorStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{weeklyStats?.activeCourses || 0}</Text>
                    <Text style={styles.statLabel}>Active Courses</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{weeklyStats?.totalStudents || 0}</Text>
                    <Text style={styles.statLabel}>Total Students</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{activeSessions.length}</Text>
                    <Text style={styles.statLabel}>Live Sessions</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Active Sessions with Countdown */}
            {activeSessions.length > 0 && (
              <Card style={styles.card}>
                <Card.Title
                  title="Active Sessions"
                  subtitle="Real-time monitoring"
                  left={(props) => <Avatar.Icon {...props} icon="broadcast" style={{ backgroundColor: '#4CAF50' }} />}
                />
                <Card.Content>
                  {activeSessions.map((session) => {
                    const timer = sessionTimers[session.id] || {};
                    const course = courses.find(c => c.id === session.courseId);
                    
                    return (
                      <Surface key={session.id} style={styles.activeSessionCard}>
                        <View style={styles.sessionHeader}>
                          <View style={styles.sessionMainInfo}>
                            <Text style={styles.sessionName}>{session.name}</Text>
                            <Text style={styles.courseName}>{course?.name}</Text>
                          </View>
                          <IconButton
                            icon="stop-circle"
                            iconColor="#F44336"
                            size={24}
                            onPress={() => handleEndSession(session.id, session.name)}
                          />
                        </View>
                        
                        <View style={styles.timerContainer}>
                          <Chip 
                            style={{ backgroundColor: timer.color }}
                            textStyle={{ color: 'white', fontSize: 12 }}
                          >
                            {timer.text}
                          </Chip>
                          {timer.progress !== undefined && (
                            <ProgressBar
                              progress={timer.progress}
                              color={timer.color}
                              style={styles.progressBar}
                            />
                          )}
                        </View>

                        <View style={styles.sessionSettings}>
                          <Chip 
                            compact 
                            icon="map-marker-radius" 
                            style={styles.settingChip}
                            textStyle={{ fontSize: 12 }}
                          >
                            {course?.settings?.gpsRadius || 50}m
                          </Chip>
                          {course?.settings?.allowLateEntry && (
                            <Chip 
                              compact 
                              icon="clock-alert" 
                              style={styles.settingChip}
                              textStyle={{ fontSize: 12 }}
                            >
                              Late: {session.lateMinutes}min
                            </Chip>
                          )}
                          {course?.settings?.requireSelfie && (
                            <Chip 
                              compact 
                              icon="camera" 
                              style={styles.settingChip}
                              textStyle={{ fontSize: 12 }}
                            >
                              Selfie
                            </Chip>
                          )}
                        </View>
                      </Surface>
                    );
                  })}
                </Card.Content>
              </Card>
            )}

            {/* Live Attendance Feed */}
            {liveAttendance.length > 0 && (
              <Card style={styles.card}>
                <Card.Title
                  title="Live Attendance"
                  subtitle="Real-time updates"
                  left={(props) => <Avatar.Icon {...props} icon="account-check" />}
                />
                <Card.Content>
                  {liveAttendance.slice(0, 5).map((attendance, index) => (
                    <View key={index} style={styles.attendanceItem}>
                      <Avatar.Text 
                        size={32} 
                        label={attendance.studentName?.substring(0, 2).toUpperCase()} 
                      />
                      <View style={styles.attendanceInfo}>
                        <Text style={styles.studentName}>{attendance.studentName}</Text>
                        <Text style={styles.attendanceTime}>
                          {format(new Date(attendance.timestamp), 'h:mm:ss a')}
                        </Text>
                      </View>
                      <Chip compact style={{ backgroundColor: '#4CAF50' }}>
                        ✓ Present
                      </Chip>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* My Courses - Horizontal Scroll */}
            <Card style={styles.card}>
              <Card.Title
                title="My Courses"
                subtitle="Quick access"
                left={(props) => <Avatar.Icon {...props} icon="school" />}
                right={() => (
                  <Button 
                    mode="text" 
                    onPress={() => navigation.navigate('Courses')}
                  >
                    View All
                  </Button>
                )}
              />
              <Card.Content>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.courseScroll}
                >
                  {courses.slice(0, 5).map((course) => (
                    <TouchableOpacity 
                      key={course.id}
                      onPress={() => navigation.navigate('Courses', {
                        screen: 'CourseDetail',
                        params: { courseId: course.id }
                      })}
                    >
                      <Surface style={styles.courseCard}>
                        <Avatar.Text 
                          size={48} 
                          label={course.name.substring(0, 2).toUpperCase()}
                          style={{ backgroundColor: '#667eea' }}
                        />
                        <Text style={styles.courseCardName}>{course.name}</Text>
                        <Text style={styles.courseCardCode}>{course.code}</Text>
                        <View style={styles.courseCardStats}>
                          <Text style={styles.courseCardStat}>
                            <MaterialCommunityIcons name="account-group" size={12} /> {(course as any).memberCount || 0}
                          </Text>
                          <Text style={styles.courseCardStat}>
                            <MaterialCommunityIcons name="broadcast" size={12} /> {(course as any).sessionCount || 0}
                          </Text>
                        </View>
                      </Surface>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCompact: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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
    fontSize: 11,
    color: '#666',
  },
  statsCard: {
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    elevation: 3,
  },
  instructorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
  },
  activeSessionCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionMainInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courseName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  timerContainer: {
    marginTop: 10,
  },
  progressBar: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
  },
  sessionSettings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  settingChip: {
    height: 32,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attendanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  attendanceTime: {
    fontSize: 12,
    color: '#666',
  },
  courseScroll: {
    marginTop: 10,
  },
  courseCard: {
    width: 120,
    padding: 15,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  courseCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  courseCardCode: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  courseCardStats: {
    marginTop: 8,
  },
  courseCardStat: {
    fontSize: 11,
    color: '#999',
  },
  // Legacy styles for backward compatibility
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    color: '#666',
    marginTop: 2,
    fontSize: 12,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  courseInfo: {
    flex: 1,
  },
  courseDescription: {
    color: '#666',
    marginTop: 2,
    fontSize: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 14,
  },
});
