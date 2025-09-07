import React, { useEffect, useState } from 'react';
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCourses } from '@/store/slices/courseSlice';
import { UserRole, CourseRole } from '@/types';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CourseListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { courses, loading } = useAppSelector((state) => state.course);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isStudent = user?.role === UserRole.STUDENT;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    loadCourses();
  }, []);

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
    setRefreshing(false);
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'ACTIVE') {
      matchesStatus = course.isActive && new Date(course.endDate) > new Date();
    } else if (filterStatus === 'COMPLETED') {
      matchesStatus = new Date(course.endDate) <= new Date();
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

  const renderCourse = ({ item }: { item: any }) => (
    <Card 
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
    >
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
          <Chip 
            style={{ backgroundColor: getRoleColor(item.role) }}
            textStyle={{ color: 'white' }}
          >
            {isStudent ? 'Enrolled' : item.role}
          </Chip>
        )}
      />
      <Card.Content>
        <View style={styles.courseInfo}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>
              {format(new Date(item.startDate), 'MMM dd')} - {format(new Date(item.endDate), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.memberCount || 0} members
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="broadcast" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.sessionCount || 0} sessions
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

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
  courseInfo: {
    marginTop: 12,
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
});
