import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import { Session, UserRole } from '@/types';
import { format, isAfter, isBefore, isToday, isTomorrow, isThisWeek } from 'date-fns';
import Toast from 'react-native-toast-message';

export default function SessionsListScreen({ route, navigation }: any) {
  const { courseId, courseName, sessions: initialSessions, sessionStats: initialStats } = route.params;
  const { user } = useAppSelector((state) => state.auth);
  const [sessions, setSessions] = useState<Session[]>(initialSessions || []);
  const [sessionStats, setSessionStats] = useState<any>(initialStats || {});
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    navigation.setOptions({
      title: `${courseName} - Sessions`,
    });
    applyFilters();
  }, [sessions, searchQuery, filter]);

  // Real-time updates setup
  useEffect(() => {
    const connectSocket = async () => {
      const connected = await socketService.connect();
      if (connected) {
        console.log('Socket connected in SessionsListScreen');
        
        // Join course room for real-time updates
        socketService.joinCourse(courseId);
        
        // Set up real-time event listeners
        const handleSessionStarted = (data: any) => {
          console.log('Session started event in SessionsList:', data);
          if (data.courseId === courseId) {
            loadSessions(); // Refresh sessions
            Toast.show({
              type: 'success',
              text1: 'Session Started',
              text2: data.sessionName || 'A session has started',
            });
          }
        };

        const handleSessionEnded = (data: any) => {
          console.log('Session ended event in SessionsList:', data);
          if (data.courseId === courseId) {
            loadSessions(); // Refresh sessions
            Toast.show({
              type: 'info',
              text1: 'Session Ended',
              text2: data.sessionName || 'A session has ended',
            });
          }
        };

        const handleSessionCreated = (data: any) => {
          console.log('Session created event in SessionsList:', data);
          if (data.courseId === courseId) {
            loadSessions(); // Refresh sessions
            Toast.show({
              type: 'info',
              text1: 'New Session',
              text2: data.sessionName || 'A new session was created',
            });
          }
        };

        const handleAttendanceMarked = (data: any) => {
          console.log('Attendance marked event in SessionsList:', data);
          // Update session stats if this is for our course
          if (data.courseId === courseId && isInstructor) {
            setSessionStats((prev: any) => {
              const updated = { ...prev };
              if (updated[data.sessionId]) {
                // Refresh just this session's stats
                loadSessions();
              }
              return updated;
            });
          }
        };

        socketService.on('session:started', handleSessionStarted);
        socketService.on('session:ended', handleSessionEnded);
        socketService.on('session:created', handleSessionCreated);
        socketService.on('attendance:marked', handleAttendanceMarked);

        // Cleanup function
        return () => {
          socketService.off('session:started', handleSessionStarted);
          socketService.off('session:ended', handleSessionEnded);
          socketService.off('session:created', handleSessionCreated);
          socketService.off('attendance:marked', handleAttendanceMarked);
          socketService.leaveCourse(courseId);
        };
      }
    };

    connectSocket();
  }, [courseId, isInstructor]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourseSessions(courseId);
      const sessionList = response.data || [];
      setSessions(sessionList);
      
      // Load attendance stats for each session if instructor
      if (isInstructor) {
        const stats: any = {};
        // Get course details to know member count
        const courseResponse = await apiService.getCourse(courseId);
        const memberCount = (courseResponse.data as any)?.memberCount || 0;
        
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
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load sessions',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...sessions];
    
    // Apply time filter
    if (filter !== 'all') {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.startTime);
        const now = new Date();
        
        switch (filter) {
          case 'active':
            return session.isActive && now >= new Date(session.startTime) && now <= new Date(session.endTime);
          case 'upcoming':
            return now < new Date(session.startTime);
          case 'past':
            return now > new Date(session.endTime);
          case 'today':
            return isToday(sessionDate);
          case 'week':
            return isThisWeek(sessionDate);
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by time (most recent first)
    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    setFilteredSessions(filtered);
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    if (!session.isActive) {
      return { label: 'INACTIVE', color: '#999' };
    } else if (now >= startTime && now <= endTime) {
      return { label: 'LIVE', color: '#4CAF50' };
    } else if (now < startTime) {
      return { label: 'UPCOMING', color: '#2196F3' };
    } else {
      return { label: 'ENDED', color: '#FF9800' };
    }
  };

  const renderSessionItem = ({ item }: { item: Session }) => {
    const status = getSessionStatus(item);
    const stats = sessionStats[item.id];
    
    return (
      <Card 
        style={styles.card}
        onPress={() => {
          if (isInstructor) {
            navigation.navigate('SessionDetail', { sessionId: item.id });
          } else {
            // For students, navigate to attendance screen
            navigation.navigate('Attendance', {
              filterSessionId: item.id,
              sessionName: item.name
            });
          }
        }}
      >
        <Card.Content>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.sessionDescription}>{item.description}</Text>
              )}
            </View>
            <Chip 
              style={{ backgroundColor: status.color }}
              textStyle={{ color: 'white' }}
              compact
            >
              {status.label}
            </Chip>
          </View>
          
          <View style={styles.sessionDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(new Date(item.startTime), 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
              </Text>
            </View>
            {item.locationName && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Text style={styles.detailText}>{item.locationName}</Text>
              </View>
            )}
          </View>
          
          {isInstructor && stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Present</Text>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.present}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Late</Text>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.late}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Absent</Text>
                <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.absent}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
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
            { value: 'active', label: 'Live' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
          ]}
          style={styles.filterButtons}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {sessions.length === 0 ? 'No sessions created yet' : 'No sessions match your search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterButtons: {
    marginBottom: 8,
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
