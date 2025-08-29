import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Avatar,
  Surface,
  Searchbar,
  SegmentedButtons,
  ActivityIndicator,
  Button,
  IconButton,
  ProgressBar,
  Title,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import locationService from '@/services/location.service';
import { Session, Attendance, UserRole } from '@/types';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { markAttendance } from '@/store/slices/attendanceSlice';

type Props = {
  route?: {
    params?: {
      filterSessionId?: string;
      sessionName?: string;
    };
  };
  navigation: any;
}

export default function AttendanceScreen({ route, navigation }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showMarkingInterface, setShowMarkingInterface] = useState(false);
  const [selectedSessionForMarking, setSelectedSessionForMarking] = useState<Session | null>(null);
  
  // Location tracking states for marking interface
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canMark, setCanMark] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [markingLoading, setMarkingLoading] = useState(false);
  
  // Check if we're filtering by a specific session
  const filterSessionId = route?.params?.filterSessionId;
  const sessionName = route?.params?.sessionName;

  useEffect(() => {
    if (showMarkingInterface && selectedSessionForMarking) {
      navigation.setOptions({ 
        title: `Mark Attendance: ${selectedSessionForMarking.name}`,
        headerRight: () => (
          <Button 
            mode="text" 
            onPress={() => {
              setShowMarkingInterface(false);
              setSelectedSessionForMarking(null);
            }}
          >
            Cancel
          </Button>
        ),
      });
    } else if (sessionName) {
      navigation.setOptions({ 
        title: `Attendance: ${sessionName}`,
        headerRight: () => (
          <Button 
            mode="text" 
            onPress={() => {
              navigation.setParams({ filterSessionId: undefined, sessionName: undefined });
              setFilter('all');
            }}
          >
            Clear Filter
          </Button>
        ),
      });
    } else {
      navigation.setOptions({ 
        title: 'Sessions',
        headerRight: undefined,
      });
    }
  }, [sessionName, navigation, showMarkingInterface, selectedSessionForMarking]);

  useEffect(() => {
    loadData();
    
    // Set up real-time event listeners for attendance updates
    const handleAttendanceMarked = (data: any) => {
      console.log('Attendance marked event received:', data);
      // Refresh attendance data
      loadData();
      
      if (user?.role === UserRole.INSTRUCTOR) {
        Toast.show({
          type: 'info',
          text1: 'Attendance Update',
          text2: `${data.userName} marked ${data.status}`,
        });
      }
    };

    const handleSessionStarted = (data: any) => {
      console.log('Session started event received:', data);
      // Refresh sessions data
      loadData();
    };

    const handleSessionEnded = (data: any) => {
      console.log('Session ended event received:', data);
      // Refresh sessions data
      loadData();
    };

    // Set up listeners
    socketService.on('attendance:marked', handleAttendanceMarked);
    socketService.on('session:started', handleSessionStarted);
    socketService.on('session:ended', handleSessionEnded);

    return () => {
      // Clean up listeners
      socketService.off('attendance:marked', handleAttendanceMarked);
      socketService.off('session:started', handleSessionStarted);
      socketService.off('session:ended', handleSessionEnded);
    };
  }, [filterSessionId]);

  // Location tracking for marking interface
  useEffect(() => {
    if (showMarkingInterface && selectedSessionForMarking) {
      startLocationTracking();
    }
    return () => {
      // Cleanup location tracking if needed
    };
  }, [showMarkingInterface, selectedSessionForMarking]);

  // Calculate distance when location changes
  useEffect(() => {
    if (userLocation && selectedSessionForMarking) {
      const dist = locationService.calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        selectedSessionForMarking.latitude,
        selectedSessionForMarking.longitude
      );
      setDistance(dist);
      setCanMark(dist <= selectedSessionForMarking.radiusMeters);
    }
  }, [userLocation, selectedSessionForMarking]);

  const startLocationTracking = async () => {
    const success = await locationService.startLocationTracking((location) => {
      setUserLocation(location);
      setLocationError('');
    });
    
    if (!success) {
      setLocationError('Failed to start location tracking');
    } else {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
      }
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedSessionForMarking || !canMark) return;

    Alert.alert(
      'Mark Attendance',
      `Mark attendance for ${selectedSessionForMarking.name}?\n\nDistance: ${distance}m from session location`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark',
          onPress: async () => {
            setMarkingLoading(true);
            try {
              await dispatch(markAttendance({
                sessionId: selectedSessionForMarking.id,
                latitude: userLocation!.coords.latitude,
                longitude: userLocation!.coords.longitude,
              }));
              
              Toast.show({
                type: 'success',
                text1: 'Attendance Marked!',
                text2: 'Your attendance has been recorded',
              });
              
              // Close marking interface and refresh data
              setShowMarkingInterface(false);
              setSelectedSessionForMarking(null);
              loadData();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to mark attendance',
                text2: 'Please try again',
              });
            } finally {
              setMarkingLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusInfo = () => {
    if (!distance || !selectedSessionForMarking) return { color: '#999', status: 'Unknown' };
    
    if (distance <= selectedSessionForMarking.radiusMeters) {
      return { color: '#4CAF50', status: 'In Range' };
    } else if (distance <= selectedSessionForMarking.radiusMeters * 1.5) {
      return { color: '#FF9800', status: 'Getting Close' };
    } else {
      return { color: '#F44336', status: 'Too Far' };
    }
  };

  useEffect(() => {
    filterData();
  }, [sessions, myAttendance, filter, searchQuery, filterSessionId]);

  const loadData = async () => {
    try {
      if (user?.role === UserRole.STUDENT) {
        // Load student's attendance history
        const attendanceResponse = await apiService.getMyAttendance();
        const attendanceList = attendanceResponse.data || [];
        setMyAttendance(attendanceList);
        
        // If filtering by session, only load that session's data
        if (filterSessionId) {
          const sessionResponse = await apiService.getSession(filterSessionId);
          setSessions(sessionResponse.data ? [sessionResponse.data] : []);
        } else {
          // For students, load sessions from their enrolled courses
          const coursesResponse = await apiService.getMyCourses();
          const userCourses = coursesResponse.data || [];
          
          // Get all sessions from all enrolled courses
          const allSessions: Session[] = [];
          for (const course of userCourses) {
            try {
              const courseSessionsResponse = await apiService.getCourseSessions(course.id);
              const courseSessions = courseSessionsResponse.data || [];
              // Add course info to each session
              const sessionsWithCourse = courseSessions.map(session => ({
                ...session,
                course: {
                  id: course.id,
                  name: course.name,
                  code: course.code,
                }
              }));
              allSessions.push(...sessionsWithCourse);
            } catch (error) {
              console.error(`Error loading sessions for course ${course.id}:`, error);
            }
          }
          setSessions(allSessions);
        }
      } else {
        // For instructors, load sessions from their courses
        const coursesResponse = await apiService.getMyCourses();
        const userCourses = coursesResponse.data || [];
        
        // Get all sessions from instructor's courses
        const allSessions: Session[] = [];
        for (const course of userCourses) {
          try {
            const courseSessionsResponse = await apiService.getCourseSessions(course.id);
            const courseSessions = courseSessionsResponse.data || [];
            // Add course info to each session
            const sessionsWithCourse = courseSessions.map(session => ({
              ...session,
              course: {
                id: course.id,
                name: course.name,
                code: course.code,
              }
            }));
            allSessions.push(...sessionsWithCourse);
          } catch (error) {
            console.error(`Error loading sessions for course ${course.id}:`, error);
          }
        }
        setSessions(allSessions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load attendance data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterData = () => {
    let filtered: any[] = [];
    
    if (user?.role === UserRole.STUDENT) {
      // For students, show attendance history
      filtered = sessions.map(session => {
        const attendance = myAttendance.find(a => a.sessionId === session.id);
        return {
          ...session,
          attendance,
          type: 'attendance',
        };
      });
      
      // Apply session filter if provided
      if (filterSessionId) {
        filtered = filtered.filter(item => item.id === filterSessionId);
      }
    } else {
      // For instructors, show sessions
      filtered = sessions.map(session => ({
        ...session,
        type: 'session',
      }));
    }
    
    // Apply time filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => {
        const sessionDate = new Date(item.startTime);
        switch (filter) {
          case 'today':
            return isToday(sessionDate);
          case 'tomorrow':
            return isTomorrow(sessionDate);
          case 'week':
            return isThisWeek(sessionDate);
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by time (most recent first)
    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    setFilteredData(filtered);
  };

  const getAttendanceStatus = (attendance?: Attendance) => {
    if (!attendance) {
      return { label: 'ABSENT', color: '#F44336' };
    }
    switch (attendance.status) {
      case 'PRESENT':
        return { label: 'PRESENT', color: '#4CAF50' };
      case 'LATE':
        return { label: 'LATE', color: '#FF9800' };
      case 'ABSENT':
        return { label: 'ABSENT', color: '#F44336' };
      default:
        return { label: 'UNKNOWN', color: '#999' };
    }
  };

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);
    const now = new Date();
    const isActive = now >= startTime && now <= endTime && item.isActive;
    const isPast = now > endTime;
    const isUpcoming = now < startTime;
    
    if (user?.role === UserRole.STUDENT) {
      const status = getAttendanceStatus(item.attendance);
      
      return (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.courseName}>{item.course?.name}</Text>
              </View>
              <Chip 
                style={{ backgroundColor: status.color }}
                textStyle={{ color: 'white' }}
              >
                {status.label}
              </Chip>
            </View>
            
            <View style={styles.itemDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {format(startTime, 'MMM dd, yyyy')}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </Text>
              </View>
              {item.attendance && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Marked at {format(new Date(item.attendance.markedAt), 'h:mm:ss a')}
                  </Text>
                </View>
              )}
            </View>
            
            {isActive && !item.attendance && (
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedSessionForMarking(item);
                  setShowMarkingInterface(true);
                }}
                style={styles.markButton}
                compact
              >
                Mark Attendance
              </Button>
            )}
          </Card.Content>
        </Card>
      );
    }
    
    // Instructor view remains the same
    return (
      <Card 
        style={styles.card}
        onPress={() => navigation.navigate('Courses', {
          screen: 'CourseDetail',
          params: { courseId: item.courseId }
        })}
      >
        <Card.Content>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.courseName}>{item.course?.name}</Text>
            </View>
            {isActive && (
              <Chip style={styles.activeChip}>LIVE</Chip>
            )}
            {isPast && (
              <Chip style={styles.pastChip}>ENDED</Chip>
            )}
            {isUpcoming && (
              <Chip style={styles.upcomingChip}>UPCOMING</Chip>
            )}
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(startTime, 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getEmptyMessage = () => {
    if (filterSessionId) {
      return 'No attendance record for this session';
    }
    switch (filter) {
      case 'today':
        return 'No sessions today';
      case 'tomorrow':
        return 'No sessions tomorrow';
      case 'week':
        return 'No sessions this week';
      default:
        return 'No sessions found';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {showMarkingInterface && selectedSessionForMarking ? (
        // Inline Attendance Marking Interface
        <View style={styles.markingContainer}>
          <Card style={styles.markingCard}>
            <Card.Content>
              <Title style={styles.markingTitle}>{selectedSessionForMarking.name}</Title>
              <Text style={styles.markingSubtitle}>Mark Your Attendance</Text>
              
              <View style={styles.statusContainer}>
                <Avatar.Icon
                  size={48}
                  icon="map-marker-check"
                  style={{ backgroundColor: getStatusInfo().color }}
                />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Your Status</Text>
                  <Text style={[styles.statusValue, { color: getStatusInfo().color }]}>
                    {getStatusInfo().status}
                  </Text>
                </View>
              </View>

              {distance !== null && (
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceLabel}>Distance from Session</Text>
                  <Text style={styles.distanceValue}>
                    {locationService.formatDistance(distance)}
                  </Text>
                  <ProgressBar
                    progress={Math.max(0, 1 - (distance / (selectedSessionForMarking.radiusMeters * 2)))}
                    color={getStatusInfo().color}
                    style={styles.progressBar}
                  />
                </View>
              )}

              {locationError && (
                <Text style={styles.errorText}>{locationError}</Text>
              )}

              <View style={styles.markingActions}>
                <Button
                  mode="contained"
                  onPress={handleMarkAttendance}
                  disabled={!canMark || markingLoading}
                  style={[
                    styles.markButton,
                    { backgroundColor: canMark ? '#4CAF50' : '#999' }
                  ]}
                  icon="check-circle"
                >
                  {markingLoading ? (
                    <ActivityIndicator color="white" />
                  ) : canMark ? (
                    'Mark Attendance'
                  ) : (
                    `Move ${locationService.formatDistance(Math.max(0, (distance || 0) - selectedSessionForMarking.radiusMeters))} closer`
                  )}
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowMarkingInterface(false);
                    setSelectedSessionForMarking(null);
                  }}
                  style={styles.cancelButton}
                  icon="arrow-left"
                >
                  Back to Sessions
                </Button>
              </View>

              <Text style={styles.helpText}>
                You must be within {selectedSessionForMarking.radiusMeters}m of the session location to mark attendance
              </Text>
            </Card.Content>
          </Card>
        </View>
      ) : (
        // Normal Sessions List View
        <>
          {!filterSessionId && (
            <View style={styles.header}>
              <Searchbar
                placeholder="Search sessions..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
              />
              
              <SegmentedButtons
                value={filter}
                onValueChange={setFilter}
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                ]}
                style={styles.filterButtons}
              />
            </View>
          )}

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : filteredData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
              <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderAttendanceItem}
              keyExtractor={item => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}
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
  filterButtons: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activeChip: {
    backgroundColor: '#4CAF50',
  },
  pastChip: {
    backgroundColor: '#999',
  },
  upcomingChip: {
    backgroundColor: '#2196F3',
  },
  itemDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  markButton: {
    marginTop: 12,
    backgroundColor: '#667eea',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  // Marking interface styles
  markingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  markingCard: {
    borderRadius: 12,
    elevation: 4,
  },
  markingTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  markingSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distanceContainer: {
    marginBottom: 16,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  markingActions: {
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    borderRadius: 30,
    borderColor: '#667eea',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    paddingHorizontal: 20,
  },
});
