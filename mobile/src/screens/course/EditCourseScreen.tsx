import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import apiService from '@/services/api.service';
import PasswordVerificationDialog from '@/components/PasswordVerificationDialog';
import { format } from 'date-fns';

export default function EditCourseScreen({ navigation, route }: any) {
  const { course } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Form fields
  const [name, setName] = useState(course.name || '');
  const [description, setDescription] = useState(course.description || '');
  const [endDate, setEndDate] = useState(new Date(course.endDate));
  
  // Validation errors
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!name.trim()) newErrors.name = 'Course name is required';
    if (name.length < 3) newErrors.name = 'Course name must be at least 3 characters';
    
    if (endDate <= new Date()) newErrors.endDate = 'End date must be in the future';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCourse = async () => {
    if (!validateForm()) return;
    setShowPasswordDialog(true);
  };

  const handlePasswordVerification = async (password: string) => {
    setLoading(true);
    try {
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        endDate: endDate.toISOString(),
        password,
      };
      
      console.log('Updating course with data:', JSON.stringify(updateData, null, 2));
      
      await apiService.editCourse(course.id, updateData);
      
      Toast.show({
        type: 'success',
        text1: 'Course Updated!',
        text2: `${name} has been updated successfully`,
      });
      
      setShowPasswordDialog(false);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating course:', error);
      
      const message = error.response?.data?.message || 'Failed to update course';
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: message,
      });
      
      throw error; // Re-throw to show error in dialog
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Course Details</Title>
              
              <TextInput
                label="Course Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>

              <TextInput
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Duration</Title>
              
              <Text style={styles.dateText}>
                Current End Date: {format(endDate, 'MMM dd, yyyy')}
              </Text>
              
              <TextInput
                label="New End Date (YYYY-MM-DD)"
                value={format(endDate, 'yyyy-MM-dd')}
                onChangeText={(text) => {
                  try {
                    const newDate = new Date(text);
                    if (!isNaN(newDate.getTime())) {
                      setEndDate(newDate);
                    }
                  } catch (error) {
                    // Invalid date, ignore
                  }
                }}
                mode="outlined"
                error={!!errors.endDate}
                style={styles.input}
                placeholder="YYYY-MM-DD"
              />
              <HelperText type="error" visible={!!errors.endDate}>
                {errors.endDate}
              </HelperText>
            </Card.Content>
          </Card>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUpdateCourse}
            loading={loading}
            disabled={loading}
            style={styles.updateButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? <ActivityIndicator color="white" /> : 'Update Course'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>

        <PasswordVerificationDialog
          visible={showPasswordDialog}
          title="Confirm Course Update"
          message="Please enter your password to confirm the course changes."
          onVerify={handlePasswordVerification}
          onDismiss={() => setShowPasswordDialog(false)}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
  },
  updateButton: {
    backgroundColor: '#667eea',
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#666',
  },
  buttonContent: {
    height: 48,
  },
});
