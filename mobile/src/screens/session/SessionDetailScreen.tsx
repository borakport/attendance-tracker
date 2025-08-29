import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  List,
  Divider,
  ActivityIndicator,
  Button,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import type { CourseStackParamList } from '@/navigation/types';
import { Session, UserRole, Attendance } from '@/types';

function SessionDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [session, setSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    loadSessionDetail();
    setupRealTimeUpdates();
  }, [sessionId]);

  const loadSessionDetail = async () => {
    try {
      setLoading(true);
      
      // Load session details
      const sessionResponse = await apiService.getSession(sessionId);
      const sessionData = sessionResponse.data;
      setSession(sessionData || null);
      
      // Load attendance records if instructor
      if (isInstructor) {
        const attendanceResponse = await apiService.getSessionAttendance(sessionId);
        setAttendance(attendanceResponse.data || []);
      }
      
      navigation.setOptions({
        title: sessionData?.name || 'Session Details'
      });
    } catch (error) {
      console.error('Error loading session details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load session details',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = async () => {
    const connected = await socketService.connect();
    if (connected) {
      socketService.monitorSession(sessionId);
      
      socketService.on('attendance:marked', (data) => {
        if (data.sessionId === sessionId) {
          loadSessionDetail(); // Refresh data
        }
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessionDetail();
    setRefreshing(false);
  };

  const toggleSessionStatus = async () => {
    if (!session || !isInstructor) return;
    
    try {
      const newStatus = !session.isActive;
      
      if (newStatus) {
        // Starting the session
        await apiService.startSession(sessionId);
      } else {
        // Ending the session
        await apiService.endSession(sessionId);
      }
      
      setSession(prev => prev ? { ...prev, isActive: newStatus } : null);
      
      Toast.show({
        type: 'success',
        text1: 'Session Updated',
        text2: `Session ${newStatus ? 'started' : 'ended'}`,
      });
    } catch (error) {
      console.error('Error toggling session status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update session',
      });
    }
  };

  const getSessionStatus = () => {
    if (!session) return { status: 'Unknown', color: theme.colors.outline };
    
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    if (session.isActive && now >= startTime && now <= endTime) {
      return { status: 'Live', color: theme.colors.error };
    } else if (now < startTime) {
      return { status: 'Upcoming', color: theme.colors.primary };
    } else if (now > endTime) {
      return { status: 'Ended', color: theme.colors.outline };
    } else if (!session.isActive) {
      return { status: 'Inactive', color: theme.colors.outline };
    }
    return { status: 'Scheduled', color: theme.colors.primary };
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const total = attendance.length;
    
    return { present, late, absent: 0, total }; // Note: absent calculation would need course member count
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading session details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text>Session not found</Text>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const sessionStatus = getSessionStatus();
  const stats = getAttendanceStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Session Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text variant="headlineSmall">{session.name}</Text>
                <Chip 
                  mode="outlined" 
                  textStyle={{ color: sessionStatus.color }}
                  style={{ borderColor: sessionStatus.color }}
                >
                  {sessionStatus.status}
                </Chip>
              </View>
              {isInstructor && (
                <IconButton
                  icon={session.isActive ? "pause" : "play"}
                  mode="contained"
                  onPress={toggleSessionStatus}
                />
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Session Details */}
        <Card style={styles.card}>
          <Card.Title title="Session Information" />
          <Card.Content>
            <List.Item
              title="Start Time"
              description={format(new Date(session.startTime), 'PPP p')}
              left={props => <List.Icon {...props} icon="clock-start" />}
            />
            <Divider />
            <List.Item
              title="End Time"
              description={format(new Date(session.endTime), 'PPP p')}
              left={props => <List.Icon {...props} icon="clock-end" />}
            />
            <Divider />
            <List.Item
              title="Location"
              description={session.locationName || 'Not specified'}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        {/* Attendance Statistics - Instructor Only */}
        {isInstructor && (
          <Card style={styles.card}>
            <Card.Title title="Attendance Overview" />
            <Card.Content>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                    {stats.present}
                  </Text>
                  <Text variant="bodySmall">Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                    {stats.late}
                  </Text>
                  <Text variant="bodySmall">Late</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={{ color: theme.colors.outline }}>
                    {stats.total}
                  </Text>
                  <Text variant="bodySmall">Total</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Attendance Records - Instructor Only */}
        {isInstructor && attendance.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Attendance Records" />
            <Card.Content>
              {attendance.map((record, index) => (
                <View key={record.id}>
                  <List.Item
                    title={`User ${record.userId}`}
                    description={`${record.status} • ${format(new Date(record.markedAt), 'p')}`}
                    left={props => (
                      <List.Icon 
                        {...props} 
                        icon={record.status === 'PRESENT' ? 'check-circle' : 'clock-alert'} 
                        color={record.status === 'PRESENT' ? theme.colors.primary : theme.colors.tertiary}
                      />
                    )}
                  />
                  {index < attendance.length - 1 && <Divider />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});

export default SessionDetailScreen;
