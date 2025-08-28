import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Surface,
  Title,
  Chip,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { signOut } from '@/store/slices/authSlice';
import apiService from '@/services/api.service';
import { UserRole } from '@/types';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Mock stats for now - replace with actual API call when available
      const mockStats = {
        totalSessions: 24,
        attendedSessions: 20,
        courseStats: [
          { courseId: '1', courseName: 'Computer Science 101', attended: 8, total: 10 },
          { courseId: '2', courseName: 'Mathematics', attended: 7, total: 8 },
          { courseId: '3', courseName: 'Physics', attended: 5, total: 6 },
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getAttendanceRate = () => {
    if (!stats) return 0;
    const total = stats.totalSessions || 0;
    const attended = stats.attendedSessions || 0;
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

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
              label={getInitials()}
              style={styles.avatar}
            />
            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Text style={styles.email}>{user?.email}</Text>
            <Chip style={styles.roleChip}>
              {user?.role}
            </Chip>
          </View>
        </LinearGradient>

        {user?.role === UserRole.STUDENT && stats && (
          <Card style={styles.statsCard}>
            <Card.Title
              title="Attendance Overview"
              subtitle="Current semester"
              left={(props) => <Avatar.Icon {...props} icon="chart-arc" />}
            />
            <Card.Content>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalSessions || 0}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.attendedSessions || 0}</Text>
                  <Text style={styles.statLabel}>Attended</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getAttendanceRate()}%</Text>
                  <Text style={styles.statLabel}>Rate</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Overall Attendance</Text>
                <ProgressBar
                  progress={getAttendanceRate() / 100}
                  color={getAttendanceRate() >= 75 ? '#4CAF50' : '#FF9800'}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {getAttendanceRate() >= 75 ? 'Good Standing' : 'Needs Improvement'}
                </Text>
              </View>

              {stats.courseStats && stats.courseStats.length > 0 && (
                <View style={styles.courseStatsContainer}>
                  <Text style={styles.sectionTitle}>By Course</Text>
                  {stats.courseStats.map((course: any) => (
                    <Surface key={course.courseId} style={styles.courseStat}>
                      <Text style={styles.courseName}>{course.courseName}</Text>
                      <View style={styles.courseStatInfo}>
                        <Text style={styles.courseStatText}>
                          {course.attended}/{course.total} sessions
                        </Text>
                        <Chip compact>{Math.round((course.attended / course.total) * 100)}%</Chip>
                      </View>
                    </Surface>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {user?.role === UserRole.INSTRUCTOR && (
          <Card style={styles.statsCard}>
            <Card.Title
              title="Teaching Overview"
              left={(props) => <Avatar.Icon {...props} icon="school" />}
            />
            <Card.Content>
              <List.Item
                title="Active Courses"
                description="Currently teaching"
                right={() => <Text style={styles.statValue}>3</Text>}
              />
              <Divider />
              <List.Item
                title="Total Students"
                description="Across all courses"
                right={() => <Text style={styles.statValue}>87</Text>}
              />
              <Divider />
              <List.Item
                title="Sessions This Week"
                description="Scheduled"
                right={() => <Text style={styles.statValue}>12</Text>}
              />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Title
            title="Account Settings"
            left={(props) => <Avatar.Icon {...props} icon="account-cog" />}
          />
          <Card.Content>
            <List.Item
              title="Edit Profile"
              description="Update your information"
              left={props => <List.Icon {...props} icon="account-edit" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })}
            />
            <Divider />
            <List.Item
              title="Change Password"
              description="Update security settings"
              left={props => <List.Icon {...props} icon="lock-reset" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="Manage preferences"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Support"
            left={(props) => <Avatar.Icon {...props} icon="help-circle" />}
          />
          <Card.Content>
            <List.Item
              title="Help Center"
              left={props => <List.Icon {...props} icon="help-circle-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Report Issue"
              left={props => <List.Icon {...props} icon="bug-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="About"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information-outline" />}
            />
          </Card.Content>
        </Card>

        <View style={styles.signOutContainer}>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            icon="logout"
          >
            Sign Out
          </Button>
        </View>
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
    padding: 32,
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
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  roleChip: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsCard: {
    margin: 16,
    borderRadius: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  courseStatsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  courseStat: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  courseStatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  courseStatText: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
  },
  signOutContainer: {
    padding: 16,
  },
  signOutButton: {
    backgroundColor: '#F44336',
    borderRadius: 24,
  },
});
