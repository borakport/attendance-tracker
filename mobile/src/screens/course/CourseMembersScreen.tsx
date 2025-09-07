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
  Avatar,
  List,
  Searchbar,
  ActivityIndicator,
  Chip,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

import { useAppSelector } from '@/hooks/redux';
import apiService from '@/services/api.service';
import socketService from '@/services/socket.service';
import { UserRole } from '@/types';

interface CourseMember {
  id: string;
  userId: string;
  courseId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CourseMembersScreen({ route, navigation }: any) {
  const { courseId, courseName } = route.params;
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [members, setMembers] = useState<CourseMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CourseMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isInstructor = user?.role === UserRole.INSTRUCTOR;

  useEffect(() => {
    navigation.setOptions({
      title: `${courseName} - Members`,
    });
    loadMembers();
    setupRealTimeUpdates();
  }, [courseId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourseMembers(courseId);
      // Handle new backend response format where members are nested in data.members
      const responseData = response.data as any;
      const memberList = responseData?.members || responseData || [];
      setMembers(memberList);
    } catch (error) {
      console.error('Error loading members:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load course members',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = async () => {
    const connected = await socketService.connect();
    if (connected) {
      socketService.joinCourse(courseId);
      
      socketService.on('member:joined', (data) => {
        if (data.courseId === courseId) {
          loadMembers(); // Refresh members list
          Toast.show({
            type: 'info',
            text1: 'New Member',
            text2: `${data.userName} joined the course`,
          });
        }
      });

      socketService.on('member:left', (data) => {
        if (data.courseId === courseId) {
          loadMembers(); // Refresh members list
          Toast.show({
            type: 'info',
            text1: 'Member Left',
            text2: `${data.userName} left the course`,
          });
        }
      });
    }
  };

  const filterMembers = () => {
    // Ensure members is an array before filtering
    const memberList = Array.isArray(members) ? members : [];
    
    if (!searchQuery) {
      setFilteredMembers(memberList);
      return;
    }

    const filtered = memberList.filter(member =>
      member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const getMemberIcon = (memberRole: string) => {
    switch (memberRole.toLowerCase()) {
      case 'instructor':
      case 'teacher':
        return 'account-tie';
      case 'assistant':
        return 'account-star';
      default:
        return 'account';
    }
  };

  const getMemberRoleColor = (memberRole: string) => {
    switch (memberRole.toLowerCase()) {
      case 'instructor':
      case 'teacher':
        return theme.colors.primary;
      case 'assistant':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const renderMember = ({ item }: { item: CourseMember }) => (
    <Card style={styles.memberCard}>
      <List.Item
        title={item.user.name}
        description={item.user.email}
        left={props => (
          <Avatar.Icon
            {...props}
            icon={getMemberIcon(item.role)}
            style={{ backgroundColor: getMemberRoleColor(item.role) }}
          />
        )}
        right={props => (
          <View style={styles.memberInfo}>
            <Chip 
              mode="outlined" 
              compact
              textStyle={{ 
                color: getMemberRoleColor(item.role),
                fontSize: 12 
              }}
              style={{ 
                borderColor: getMemberRoleColor(item.role),
                marginBottom: 4
              }}
            >
              {item.role}
            </Chip>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Joined {format(new Date(item.joinedAt), 'MMM dd, yyyy')}
            </Text>
          </View>
        )}
      />
    </Card>
  );

  const getStats = () => {
    // Ensure members is an array before filtering
    const memberList = Array.isArray(members) ? members : [];
    
    const instructors = memberList.filter(m => 
      m.role.toLowerCase() === 'instructor' || m.role.toLowerCase() === 'teacher'
    ).length;
    const students = memberList.filter(m => 
      m.role.toLowerCase() === 'student'
    ).length;
    const assistants = memberList.filter(m => 
      m.role.toLowerCase() === 'assistant'
    ).length;

    return { instructors, students, assistants, total: memberList.length };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading members...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {/* Statistics Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statsTitle}>
              Course Statistics
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {stats.total}
                </Text>
                <Text variant="bodySmall">Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {stats.instructors}
                </Text>
                <Text variant="bodySmall">Instructors</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={{ color: theme.colors.outline }}>
                  {stats.students}
                </Text>
                <Text variant="bodySmall">Students</Text>
              </View>
              {stats.assistants > 0 && (
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                    {stats.assistants}
                  </Text>
                  <Text variant="bodySmall">Assistants</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search members..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Members List */}
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  memberCard: {
    marginBottom: 8,
    elevation: 1,
  },
  memberInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
});
