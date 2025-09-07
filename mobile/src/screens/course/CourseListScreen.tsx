import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Searchbar,
  Chip,
  Avatar,
  Button,
  Surface,
  ActivityIndicator,
  useTheme,
  IconButton,
  Menu,
  ProgressBar,
  Divider,
  Modal,
  Portal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCourses } from '@/store/slices/courseSlice';
import { UserRole, CourseRole } from '@/types';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '@/services/api.service';
import { Alert } from 'react-native';

// Safe date parsing function
const safeParseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return null;
  }
};

export default function CourseListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses, loading } = useAppSelector((state) => state.course);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [courseStats, setCourseStats] = useState<Record<string, {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    attendanceRate: number;
  }>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [courseToLeave, setCourseToLeave] = useState<any>(null);
  const [lecturerPassword, setLecturerPassword] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const isStudent = user?.role === UserRole.STUDENT;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      loadCourseStats();
    }
  }, [courses]);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh courses when screen comes into focus
      loadCourses();
    }, [])
  );

  useEffect(() => {
    // Update navigation title
    navigation.setOptions({ title: 'My Courses' });
  }, [navigation]);

  const loadCourses = async () => {
    try {
      await dispatch(fetchCourses()).unwrap();
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    await loadCourseStats();
    setRefreshing(false);
  };

  const loadCourseStats = async () => {
    try {
      const statsPromises = courses.map(async (course: any) => {
        try {
          const response = await apiService.getCourseSessions(course.id);
          const sessions = response.data || []; // Extract data from API response with fallback
          const now = new Date();
          
          const activeSessions = sessions.filter((session: any) => {
            const startTime = new Date(session.startTime);
            const endTime = new Date(session.endTime);
            return startTime <= now && now <= endTime;
          }).length;
          
          const completedSessions = sessions.filter((session: any) => {
            const endTime = new Date(session.endTime);
            return endTime < now;
          }).length;
          
          const upcomingSessions = sessions.filter((session: any) => {
            const startTime = new Date(session.startTime);
            return startTime > now;
          }).length;

          // Calculate attendance rate across all sessions
          let totalAttendanceRate = 0;
          if (sessions.length > 0) {
            try {
              const attendancePromises = sessions.map(async (session: any) => {
                try {
                  const attendanceResponse = await apiService.getSessionAttendance(session.id);
                  const attendanceRecords = attendanceResponse.data || [];
                  const presentCount = attendanceRecords.filter((record: any) => 
                    record.status === 'PRESENT'
                  ).length;
                  const totalCount = attendanceRecords.length;
                  return totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
                } catch (error) {
                  console.error(`Error loading attendance for session ${session.id}:`, error);
                  return 0;
                }
              });
              
              const attendanceRates = await Promise.all(attendancePromises);
              totalAttendanceRate = attendanceRates.length > 0 
                ? attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length 
                : 0;
            } catch (error) {
              console.error('Error calculating attendance rate:', error);
              totalAttendanceRate = 0;
            }
          }

          return {
            courseId: course.id,
            stats: {
              totalSessions: sessions.length,
              activeSessions,
              completedSessions,
              upcomingSessions,
              attendanceRate: totalAttendanceRate
            }
          };
        } catch (error) {
          console.error(`Error loading stats for course ${course.id}:`, error);
          return {
            courseId: course.id,
            stats: {
              totalSessions: 0,
              activeSessions: 0,
              completedSessions: 0,
              upcomingSessions: 0,
              attendanceRate: 0
            }
          };
        }
      });

      const results = await Promise.all(statsPromises);
      const newStats: Record<string, any> = {};
      results.forEach(({ courseId, stats }) => {
        newStats[courseId] = stats;
      });
      setCourseStats(newStats);
    } catch (error) {
      console.error('Error loading course statistics:', error);
    }
  };

  const toggleMenu = (courseId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const closeMenu = (courseId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [courseId]: false
    }));
  };

  const handleCourseAction = (action: string, course: any) => {
    closeMenu(course.id);
    
    switch (action) {
      case 'sessions':
        navigation.navigate('SessionsList', { 
          courseId: course.id, 
          courseName: course.name 
        });
        break;
      case 'members':
        navigation.navigate('CourseMembers', { 
          courseId: course.id, 
          courseName: course.name 
        });
        break;
      case 'attendance':
        // Navigate to student's attendance history for this course
        navigation.navigate('Attendance', { 
          screen: 'AttendanceHistory',
          params: {
            courseId: course.id, 
            courseName: course.name,
            filterByCourse: true
          }
        });
        break;
      case 'edit':
        navigation.navigate('EditCourse', { course });
        break;
      case 'settings':
        navigation.navigate('CourseSettings', { course });
        break;
      case 'leave':
        leaveCourseWithPassword(course);
        break;
      case 'delete':
        deleteCourse(course);
        break;
    }
  };

  const leaveCourseWithPassword = (course: any) => {
    Alert.alert(
      'Leave Course - First Confirmation',
      `Are you sure you want to leave "${course.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setCourseToLeave(course);
            setLeaveModalVisible(true);
          }
        }
      ]
    );
  };

  const confirmLeaveCourse = async () => {
    if (!studentPassword.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm leaving the course');
      return;
    }

    try {
      // Verify password first
      const verifyResponse = await apiService.verifyPassword(studentPassword);

      if (!verifyResponse.success) {
        Alert.alert('Error', 'Invalid password. Please try again.');
        setStudentPassword('');
        return;
      }

      // If password is valid, proceed with leaving the course
      await apiService.leaveCourse(courseToLeave.id, studentPassword);
      await loadCourses();
      
      // Reset modal state
      setLeaveModalVisible(false);
      setCourseToLeave(null);
      setStudentPassword('');
      
      Alert.alert('Success', 'You have left the course successfully');
    } catch (error) {
      console.error('Error leaving course:', error);
      Alert.alert('Error', 'Invalid password or failed to leave course. Please try again.');
      setStudentPassword('');
    }
  };

  const cancelLeaveCourse = () => {
    setLeaveModalVisible(false);
    setCourseToLeave(null);
    setStudentPassword('');
  };

  const leaveCourse = (course: any) => {
    // This function is kept for backward compatibility but should use password verification
    // Redirect to the password-protected version
    leaveCourseWithPassword(course);
  };

  const deleteCourse = (course: any) => {
    Alert.alert(
      'Delete Course - First Confirmation',
      `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setCourseToDelete(course);
            setDeleteModalVisible(true);
          }
        }
      ]
    );
  };

  const confirmDeleteCourse = async () => {
    if (!lecturerPassword.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm deletion');
      return;
    }

    try {
      // Verify password first
      const verifyResponse = await apiService.verifyPassword(lecturerPassword);

      if (!verifyResponse.success) {
        Alert.alert('Error', 'Invalid password. Please try again.');
        setLecturerPassword('');
        return;
      }

      // If password is valid, proceed with deletion
      await apiService.deleteCourse(courseToDelete.id, lecturerPassword);
      await loadCourses();
      
      // Reset modal state
      setDeleteModalVisible(false);
      setCourseToDelete(null);
      setLecturerPassword('');
      
      Alert.alert('Success', 'Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      Alert.alert('Error', 'Invalid password or failed to delete course. Please try again.');
      setLecturerPassword('');
    }
  };

  const cancelDeleteCourse = () => {
    setDeleteModalVisible(false);
    setCourseToDelete(null);
    setLecturerPassword('');
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'ACTIVE') {
      const endDate = safeParseDate(course.endDate);
      matchesStatus = course.isActive && (endDate ? endDate > new Date() : false);
    } else if (filterStatus === 'COMPLETED') {
      const endDate = safeParseDate(course.endDate);
      matchesStatus = endDate ? endDate <= new Date() : false;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getRoleColor = (role?: CourseRole) => {
    switch (role) {
      case CourseRole.OWNER: return '#4CAF50';
      case CourseRole.MODERATOR: return '#FF9800';
      case CourseRole.PARTICIPANT: return '#2196F3';
      default: return '#757575';
    }
  };

  const renderCourse = ({ item }: { item: any }) => {
    const stats = courseStats[item.id] || {
      totalSessions: 0,
      activeSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      attendanceRate: 0
    };
    
    const isOwner = item.role === CourseRole.OWNER;

    return (
      <Card style={styles.courseCard}>
        {/* Course Header with Three Dots Menu */}
        <Card.Title
          title={item.name}
          subtitle={`Code: ${item.code}`}
          left={(props) => (
            <Avatar.Text 
              {...props} 
              label={item.name.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: getRoleColor(item.role) }}
            />
          )}
          right={() => (
            <View style={styles.cardHeader}>
              {item.isActive && (
                <Chip 
                  mode="outlined"
                  compact
                  style={styles.activeChip}
                  textStyle={{ color: '#4CAF50' }}
                >
                  Active
                </Chip>
              )}
              <Menu
                visible={openMenus[item.id] || false}
                onDismiss={() => closeMenu(item.id)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => toggleMenu(item.id)}
                  />
                }
              >
                <Menu.Item 
                  onPress={() => handleCourseAction('sessions', item)}
                  title="View Sessions" 
                  leadingIcon="broadcast"
                />
                <Menu.Item 
                  onPress={() => handleCourseAction('members', item)}
                  title="View Members" 
                  leadingIcon="account-group"
                />
                {isInstructor && (
                  <>
                    <Divider />
                    <Menu.Item 
                      onPress={() => handleCourseAction('edit', item)}
                      title="Edit Course" 
                      leadingIcon="pencil"
                    />
                    <Menu.Item 
                      onPress={() => handleCourseAction('settings', item)}
                      title="Course Settings" 
                      leadingIcon="cog"
                    />
                    <Divider />
                    <Menu.Item 
                      onPress={() => handleCourseAction('delete', item)}
                      title="Delete Course" 
                      leadingIcon="delete"
                    />
                  </>
                )}
                {isStudent && (
                  <>
                    <Divider />
                    <Menu.Item 
                      onPress={() => handleCourseAction('attendance', item)}
                      title="Attendance History" 
                      leadingIcon="calendar-check"
                    />
                    <Menu.Item 
                      onPress={() => handleCourseAction('leave', item)}
                      title="Leave Course" 
                      leadingIcon="exit-to-app"
                    />
                  </>
                )}
              </Menu>
            </View>
          )}
        />
        
        {/* Course Content */}
        <Card.Content>
          {/* Course Description */}
          {item.description && (
            <Text 
              style={styles.description} 
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          )}
          
          {/* Course Dates */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>
              {(() => {
                const startDate = safeParseDate(item.startDate);
                const endDate = safeParseDate(item.endDate);
                if (startDate && endDate) {
                  return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
                }
                return 'Date not available';
              })()}
            </Text>
          </View>

          {/* Statistics Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{item.memberCount || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.activeSessions}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.upcomingSessions}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>

          {/* Attendance Rate Section */}
          {stats.totalSessions > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Attendance Rate</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(stats.attendanceRate)}%
                </Text>
              </View>
              <ProgressBar 
                progress={stats.attendanceRate / 100} 
                color="#4CAF50"
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                Average attendance across all sessions
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search courses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.filters}>
          <Chip
            selected={filterStatus === 'ALL'}
            onPress={() => setFilterStatus('ALL')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filterStatus === 'ACTIVE'}
            onPress={() => setFilterStatus('ACTIVE')}
            style={styles.filterChip}
          >
            Active
          </Chip>
          <Chip
            selected={filterStatus === 'COMPLETED'}
            onPress={() => setFilterStatus('COMPLETED')}
            style={styles.filterChip}
          >
            Completed
          </Chip>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="school-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No courses found' : 'No courses enrolled'}
          </Text>
          {isStudent && (
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('JoinCourse')}
              style={styles.emptyButton}
            >
              Join a Course
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourse}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={
          isStudent ? [
            {
              icon: 'qrcode-scan',
              label: 'Join Course',
              onPress: () => navigation.navigate('JoinCourse'),
            },
          ] : [
            {
              icon: 'qrcode-scan',
              label: 'Join Course',
              onPress: () => navigation.navigate('JoinCourse'),
            },
            {
              icon: 'plus-circle',
              label: 'Create Course',
              onPress: () => navigation.navigate('CreateCourse'),
            },
          ]
        }
        onStateChange={({ open }) => setFabOpen(open)}
        fabStyle={styles.fab}
      />

      {/* Password Confirmation Modal for Course Deletion */}
      <Portal>
        <Modal 
          visible={deleteModalVisible} 
          onDismiss={cancelDeleteCourse}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Confirm Course Deletion</Text>
          <Text style={styles.modalSubtitle}>
            Enter your password to permanently delete "{courseToDelete?.name}"
          </Text>
          <TextInput
            mode="outlined"
            label="Your Password"
            value={lecturerPassword}
            onChangeText={setLecturerPassword}
            secureTextEntry
            style={styles.passwordInput}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={cancelDeleteCourse}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={confirmDeleteCourse}
              style={[styles.modalButton, styles.deleteButton]}
              buttonColor="#d32f2f"
            >
              Delete Course
            </Button>
          </View>
        </Modal>

        {/* Password Confirmation Modal for Leaving Course */}
        <Modal 
          visible={leaveModalVisible} 
          onDismiss={cancelLeaveCourse}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Confirm Leave Course</Text>
          <Text style={styles.modalSubtitle}>
            Enter your password to leave "{courseToLeave?.name}"
          </Text>
          <TextInput
            mode="outlined"
            label="Your Password"
            value={studentPassword}
            onChangeText={setStudentPassword}
            secureTextEntry
            style={styles.passwordInput}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={cancelLeaveCourse}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={confirmLeaveCourse}
              style={[styles.modalButton, styles.leaveButton]}
              buttonColor="#ff9800"
            >
              Leave Course
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeChip: {
    borderColor: '#4CAF50',
  },
  courseInfo: {
    marginTop: 12,
  },
  description: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressSection: {
    marginVertical: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 24,
  },
  fab: {
    backgroundColor: '#667eea',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#d32f2f',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  passwordInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  leaveButton: {
    backgroundColor: '#ff9800',
  },
});
