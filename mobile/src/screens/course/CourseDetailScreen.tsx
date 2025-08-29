import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
  TextInput,
  Modal,
  Portal,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import { Course, Session, UserRole, CourseRole } from '@/types';
import { format, isAfter, isBefore, isToday } from 'date-fns';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionStats, setSessionStats] = useState<any>({});
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<'gpsRadius' | 'lateEntry' | 'selfie' | null>(null);
  const [tempSettingValue, setTempSettingValue] = useState('');

  useEffect(() => {
    loadCourseData();
    // Join course room for real-time updates
    socketService.joinCourse(courseId);

    // Define event handlers
    const handleSessionCreated = (data: any) => {
      if (data.courseId === courseId) {
        console.log('Session created for this course:', data);
        loadCourseData(); // Refresh data
        Toast.show({
          type: 'success',
          text1: 'New Session',
          text2: data.sessionName || 'A new session was created',
        });
      }
    };

    const handleSessionStarted = (data: any) => {
      if (data.courseId === courseId) {
        console.log('Session started for this course:', data);
        loadCourseData(); // Refresh data
      }
    };

    const handleSessionEnded = (data: any) => {
      if (data.courseId === courseId) {
        console.log('Session ended for this course:', data);
        loadCourseData(); // Refresh data
      }
    };

    const handleAttendanceMarked = (data: any) => {
      if (data.courseId === courseId) {
        console.log('Attendance marked in this course:', data);
        // Update session stats
        loadCourseData();
      }
    };

    const handleMemberJoined = (data: any) => {
      if (data.courseId === courseId) {
        console.log('New member joined this course:', data);
        loadCourseData(); // Refresh data
      }
    };

    const handleMemberLeft = (data: any) => {
      if (data.courseId === courseId) {
        console.log('Member left this course:', data);
        loadCourseData(); // Refresh data
      }
    };

    // Set up real-time event listeners
    socketService.on('session:created', handleSessionCreated);
    socketService.on('session:started', handleSessionStarted);
    socketService.on('session:ended', handleSessionEnded);
    socketService.on('attendance:marked', handleAttendanceMarked);
    socketService.on('member:joined', handleMemberJoined);
    socketService.on('member:left', handleMemberLeft);

    return () => {
      socketService.leaveCourse(courseId);
      // Clean up event listeners
      socketService.off('session:created', handleSessionCreated);
      socketService.off('session:started', handleSessionStarted);
      socketService.off('session:ended', handleSessionEnded);
      socketService.off('attendance:marked', handleAttendanceMarked);
      socketService.off('member:joined', handleMemberJoined);
      socketService.off('member:left', handleMemberLeft);
    };
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const courseResponse = await apiService.getCourse(courseId);
      setCourse(courseResponse.data || null);
      
      // Load member count
      try {
        const membersResponse = await apiService.getCourseMembers(courseId);
        const memberList = membersResponse.data || [];
        setMemberCount(memberList.length);
      } catch (memberError) {
        console.log('Error loading members count:', memberError);
        setMemberCount(0);
      }
      
      try {
        const sessionsResponse = await apiService.getCourseSessions(courseId);
        const sessionList = sessionsResponse.data || [];
        setSessions(sessionList);
        
        // Load attendance stats for each session
        const stats: any = {};
        
        for (const session of sessionList) {
          try {
            const attendanceResponse = await apiService.getSessionAttendance(session.id);
            const attendanceList = attendanceResponse.data || [];
            stats[session.id] = {
              total: memberCount,
              present: attendanceList.filter((a: any) => a.status === 'PRESENT').length,
              late: attendanceList.filter((a: any) => a.status === 'LATE').length,
              absent: memberCount - attendanceList.length,
            };
          } catch (error) {
            console.log('Error loading session attendance:', error);
          }
        }
        setSessionStats(stats);
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

  const handleUpdateSetting = async () => {
    if (!course || !selectedSetting) return;
    
    try {
      const updates: any = { ...course.settings };
      
      switch (selectedSetting) {
        case 'gpsRadius':
          updates.gpsRadius = parseInt(tempSettingValue);
          break;
        case 'lateEntry':
          updates.allowLateEntry = tempSettingValue === 'true';
          updates.lateEntryMinutes = parseInt(tempSettingValue);
          break;
        case 'selfie':
          updates.requireSelfie = tempSettingValue === 'true';
          break;
      }
      
      await apiService.updateCourse(course.id, { settings: updates });
      
      Toast.show({
        type: 'success',
        text1: 'Settings Updated',
        text2: 'Course settings have been updated',
      });
      
      setSettingsModalVisible(false);
      await loadCourseData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update settings',
      });
    }
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

  const navigateToSessionDetail = (session: Session) => {
    const isStudent = user?.role === UserRole.STUDENT;
    
    if (isStudent) {
      // For students, navigate to their attendance history for this session
      navigation.navigate('Attendance', {
        screen: 'AttendanceList',
        params: { 
          filterSessionId: session.id,
          sessionName: session.name 
        }
      });
    } else {
      // For instructors, navigate to session management/attendance records
      navigation.navigate('SessionDetail', { 
        sessionId: session.id,
        courseId: course?.id 
      });
    }
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    if (session.isActive && now >= startTime && now <= endTime) {
      return { label: 'LIVE', color: '#4CAF50' };
    } else if (isBefore(now, startTime)) {
      return { label: 'UPCOMING', color: '#2196F3' };
    } else {
      return { label: 'COMPLETED', color: '#999' };
    }
  };

  const getAttendancePercentage = (sessionId: string) => {
    const stats = sessionStats[sessionId];
    if (!stats || stats.total === 0) return 0;
    return Math.round(((stats.present + stats.late) / stats.total) * 100);
  };

  const categorizedSessions = {
    active: sessions.filter(s => {
      const now = new Date();
      return s.isActive && now >= new Date(s.startTime) && now <= new Date(s.endTime);
    }),
    upcoming: sessions.filter(s => {
      const now = new Date();
      return isAfter(new Date(s.startTime), now);
    }),
    past: sessions.filter(s => {
      const now = new Date();
      return isBefore(new Date(s.endTime), now) && !s.isActive;
    }),
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

  const isOwner = (course as any)?.role === CourseRole.OWNER || (course as any)?.ownerId === user?.id;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isStudent = user?.role === UserRole.STUDENT;

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
              description={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
              left={props => <List.Icon {...props} icon="account-group" />}
              {...(!isStudent && {
                right: props => <List.Icon {...props} icon="chevron-right" />,
                onPress: () => navigation.navigate('CourseMembers', { 
                  courseId: courseId,
                  courseName: course?.name
                })
              })}
            />
            <Divider />
            <List.Item
              title="Total Sessions"
              description={`${sessions.length} sessions`}
              left={props => <List.Icon {...props} icon="broadcast" />}
              {...(!isStudent && {
                right: props => <List.Icon {...props} icon="chevron-right" />,
                onPress: () => navigation.navigate('SessionsList', { 
                  courseId: courseId,
                  courseName: course?.name,
                  sessions: sessions,
                  sessionStats: sessionStats
                })
              })}
            />
          </Card.Content>
        </Card>

        {/* Active Sessions - placeholder for completion */}
        {categorizedSessions.active.length > 0 && (
          <Card style={styles.card}>
            <Card.Title
              title="Active Sessions"
              subtitle={`${categorizedSessions.active.length} ongoing`}
              left={(props) => <Avatar.Icon {...props} icon="broadcast" style={styles.iconActive} />}
            />
            <Card.Content>
              {categorizedSessions.active.map((session: Session) => (
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

        {categorizedSessions.upcoming.length > 0 && (
          <Card style={styles.card}>
            <Card.Title
              title="Upcoming Sessions"
              subtitle="Next 5 sessions"
              left={(props) => <Avatar.Icon {...props} icon="calendar-clock" />}
            />
            <Card.Content>
              {categorizedSessions.upcoming.map((session: Session) => (
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
          <TouchableOpacity onPress={() => setSettingsExpanded(!settingsExpanded)}>
            <Card.Title
              title="Settings"
              left={(props) => <Avatar.Icon {...props} icon="cog" />}
              right={(props) => (
                <IconButton
                  icon={settingsExpanded ? "chevron-up" : "chevron-down"}
                  onPress={() => setSettingsExpanded(!settingsExpanded)}
                />
              )}
            />
          </TouchableOpacity>
          {settingsExpanded && (
            <Card.Content>
              <List.Item
                title="GPS Radius"
                description={`${course.settings?.gpsRadius || 50}m`}
                left={props => <List.Icon {...props} icon="map-marker-radius" />}
                right={() => isOwner && (
                  <IconButton 
                    icon="pencil" 
                    size={20}
                    onPress={() => {
                      setSelectedSetting('gpsRadius');
                      setTempSettingValue((course.settings?.gpsRadius || 50).toString());
                      setSettingsModalVisible(true);
                    }}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Late Entry"
                description={course.settings?.allowLateEntry ? 
                  `Allowed (${course.settings?.lateEntryMinutes || 15} minutes)` : 
                  'Not allowed'}
                left={props => <List.Icon {...props} icon="clock-alert" />}
                right={() => isOwner && (
                  <IconButton 
                    icon="pencil" 
                    size={20}
                    onPress={() => {
                      setSelectedSetting('lateEntry');
                      setTempSettingValue((course.settings?.lateEntryMinutes || 15).toString());
                      setSettingsModalVisible(true);
                    }}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Selfie Required"
                description={course.settings?.requireSelfie ? 'Yes' : 'No'}
                left={props => <List.Icon {...props} icon="camera" />}
                right={() => isOwner && (
                  <IconButton 
                    icon="pencil" 
                    size={20}
                    onPress={() => {
                      setSelectedSetting('selfie');
                      setTempSettingValue(course.settings?.requireSelfie ? 'true' : 'false');
                      setSettingsModalVisible(true);
                    }}
                  />
                )}
              />
            </Card.Content>
          )}
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

      <Portal>
        <Modal
          visible={settingsModalVisible}
          onDismiss={() => setSettingsModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>
            {selectedSetting === 'gpsRadius' && 'GPS Radius'}
            {selectedSetting === 'lateEntry' && 'Late Entry Minutes'}
            {selectedSetting === 'selfie' && 'Require Selfie'}
          </Title>
          
          {selectedSetting === 'gpsRadius' && (
            <TextInput
              label="Radius in meters"
              value={tempSettingValue}
              onChangeText={setTempSettingValue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.modalInput}
            />
          )}
          
          {selectedSetting === 'lateEntry' && (
            <TextInput
              label="Minutes allowed for late entry"
              value={tempSettingValue}
              onChangeText={setTempSettingValue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.modalInput}
            />
          )}
          
          {selectedSetting === 'selfie' && (
            <View>
              <Button
                mode={tempSettingValue === 'true' ? 'contained' : 'outlined'}
                onPress={() => setTempSettingValue('true')}
                style={styles.modalButton}
              >
                Required
              </Button>
              <Button
                mode={tempSettingValue === 'false' ? 'contained' : 'outlined'}
                onPress={() => setTempSettingValue('false')}
                style={styles.modalButton}
              >
                Not Required
              </Button>
            </View>
          )}
          
          <View style={styles.modalActions}>
            <Button onPress={() => setSettingsModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleUpdateSetting}>
              Update
            </Button>
          </View>
        </Modal>
      </Portal>
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButton: {
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
});
