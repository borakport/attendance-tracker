import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Chip,
  Searchbar,
  FAB,
  Menu,
  Button,
  Divider,
  Surface,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/hooks/redux';
import { UserRole } from '@/types';
import { format, parseISO, isSameDay, isAfter, isBefore } from 'date-fns';
import Toast from 'react-native-toast-message';

interface AttendanceRecord {
  id: string;
  sessionId: string;
  courseId: string;
  courseName: string;
  sessionTitle: string;
  markedAt: string;
  status: 'present' | 'late' | 'absent';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export default function AttendanceScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, searchQuery, selectedFilter, dateFilter]);

  const loadAttendanceRecords = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          sessionId: 'session1',
          courseId: 'course1',
          courseName: 'Computer Science 101',
          sessionTitle: 'Lecture 1: Introduction to Programming',
          markedAt: '2024-01-15T09:00:00Z',
          status: 'present',
        },
        {
          id: '2',
          sessionId: 'session2',
          courseId: 'course2',
          courseName: 'Mathematics',
          sessionTitle: 'Calculus Fundamentals',
          markedAt: '2024-01-14T14:30:00Z',
          status: 'late',
        },
        {
          id: '3',
          sessionId: 'session3',
          courseId: 'course1',
          courseName: 'Computer Science 101',
          sessionTitle: 'Lecture 2: Variables and Data Types',
          markedAt: '2024-01-13T09:15:00Z',
          status: 'present',
        },
        {
          id: '4',
          sessionId: 'session4',
          courseId: 'course3',
          courseName: 'Physics',
          sessionTitle: 'Classical Mechanics',
          markedAt: '2024-01-12T11:00:00Z',
          status: 'absent',
        },
        {
          id: '5',
          sessionId: 'session5',
          courseId: 'course2',
          courseName: 'Mathematics',
          sessionTitle: 'Linear Algebra',
          markedAt: '2024-01-11T15:00:00Z',
          status: 'present',
        },
      ];
      
      setAttendanceRecords(mockRecords);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load attendance records'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = attendanceRecords;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(record => record.status === selectedFilter);
    }

    // Apply date filter
    const now = new Date();
    filtered = filtered.filter(record => {
      const recordDate = parseISO(record.markedAt);
      switch (dateFilter) {
        case 'today':
          return isSameDay(recordDate, now);
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return isAfter(recordDate, weekAgo);
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return isAfter(recordDate, monthAgo);
        default:
          return true;
      }
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());

    setFilteredRecords(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceRecords();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'check-circle';
      case 'late':
        return 'clock-alert';
      case 'absent':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.attendanceCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <Text style={styles.sessionTitle} numberOfLines={2}>
              {item.sessionTitle}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
            icon={getStatusIcon(item.status)}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateTime}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color="#666"
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              {format(parseISO(item.markedAt), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.dateTime}>
            <MaterialCommunityIcons
              name="clock"
              size={16}
              color="#666"
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              {format(parseISO(item.markedAt), 'hh:mm a')}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    
    return { total, present, late, absent };
  };

  const stats = getAttendanceStats();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRecords.length} records found
        </Text>
      </LinearGradient>

      {/* Stats Overview */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.late}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </Surface>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search courses or sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
              icon="filter"
              compact
            >
              Filter
            </Button>
          }
        >
          <Menu.Item
            title="All Records"
            onPress={() => {
              setSelectedFilter('all');
              setDateFilter('all');
              setFilterMenuVisible(false);
            }}
            leadingIcon="format-list-bulleted"
          />
          <Divider />
          <Menu.Item
            title="Present Only"
            onPress={() => {
              setSelectedFilter('present');
              setFilterMenuVisible(false);
            }}
            leadingIcon="check-circle"
          />
          <Menu.Item
            title="Late Only"
            onPress={() => {
              setSelectedFilter('late');
              setFilterMenuVisible(false);
            }}
            leadingIcon="clock-alert"
          />
          <Menu.Item
            title="Absent Only"
            onPress={() => {
              setSelectedFilter('absent');
              setFilterMenuVisible(false);
            }}
            leadingIcon="close-circle"
          />
          <Divider />
          <Menu.Item
            title="Today"
            onPress={() => {
              setDateFilter('today');
              setFilterMenuVisible(false);
            }}
            leadingIcon="calendar-today"
          />
          <Menu.Item
            title="This Week"
            onPress={() => {
              setDateFilter('week');
              setFilterMenuVisible(false);
            }}
            leadingIcon="calendar-week"
          />
          <Menu.Item
            title="This Month"
            onPress={() => {
              setDateFilter('month');
              setFilterMenuVisible(false);
            }}
            leadingIcon="calendar-month"
          />
        </Menu>
      </View>

      {/* Attendance List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyText}>No attendance records found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your attendance records will appear here'}
            </Text>
          </View>
        }
      />

      {user?.role === UserRole.STUDENT && (
        <FAB
          icon="qrcode-scan"
          style={styles.fab}
          onPress={() => navigation.navigate('JoinCourse')}
          label="Scan QR"
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
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  filterButton: {
    borderRadius: 24,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  attendanceCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
});
