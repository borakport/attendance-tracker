import React, { useState } from 'react';
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
  Paragraph,
  RadioButton,
  Surface,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch } from '@/hooks/redux';
import { signUp } from '@/store/slices/authSlice';
import { UserRole } from '@/types';
import Toast from 'react-native-toast-message';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  studentId?: string; // Required for students
  employeeId?: string; // Required for instructors
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  studentId?: string;
  employeeId?: string;
}

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.role === UserRole.STUDENT) {
      if (!formData.studentId?.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
    } else if (formData.role === UserRole.INSTRUCTOR) {
      if (!formData.employeeId?.trim()) {
        newErrors.employeeId = 'Employee ID is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === UserRole.STUDENT 
          ? { studentId: formData.studentId } 
          : { employeeId: formData.employeeId }
        ),
      };

      await dispatch(signUp(registerData)).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Welcome to Smart Attendance!',
      });

      // Navigation will be handled by auth state change
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Please check your information and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterFormData, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <MaterialCommunityIcons 
              name="account-plus" 
              size={60} 
              color="white" 
            />
            <Title style={styles.headerTitle}>Create Account</Title>
            <Paragraph style={styles.headerSubtitle}>
              Join Smart Attendance System
            </Paragraph>
          </LinearGradient>

          {/* Registration Form */}
          <Card style={styles.formCard}>
            <Card.Content>
              {/* Role Selection */}
              <Text style={styles.sectionTitle}>I am a:</Text>
              <View style={styles.roleSelection}>
                <Surface style={[
                  styles.roleCard,
                  formData.role === UserRole.STUDENT && styles.roleCardSelected
                ]}>
                  <RadioButton
                    value={UserRole.STUDENT}
                    status={formData.role === UserRole.STUDENT ? 'checked' : 'unchecked'}
                    onPress={() => updateFormData('role', UserRole.STUDENT)}
                  />
                  <View style={styles.roleInfo}>
                    <MaterialCommunityIcons 
                      name="school" 
                      size={24} 
                      color={formData.role === UserRole.STUDENT ? '#667eea' : '#666'} 
                    />
                    <Text style={styles.roleText}>Student</Text>
                  </View>
                </Surface>

                <Surface style={[
                  styles.roleCard,
                  formData.role === UserRole.INSTRUCTOR && styles.roleCardSelected
                ]}>
                  <RadioButton
                    value={UserRole.INSTRUCTOR}
                    status={formData.role === UserRole.INSTRUCTOR ? 'checked' : 'unchecked'}
                    onPress={() => updateFormData('role', UserRole.INSTRUCTOR)}
                  />
                  <View style={styles.roleInfo}>
                    <MaterialCommunityIcons 
                      name="account-tie" 
                      size={24} 
                      color={formData.role === UserRole.INSTRUCTOR ? '#667eea' : '#666'} 
                    />
                    <Text style={styles.roleText}>Instructor</Text>
                  </View>
                </Surface>
              </View>

              {/* Personal Information */}
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.nameInput, { marginRight: 8 }]}
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(text) => updateFormData('firstName', text)}
                  error={!!errors.firstName}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  style={[styles.nameInput, { marginLeft: 8 }]}
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(text) => updateFormData('lastName', text)}
                  error={!!errors.lastName}
                />
              </View>
              
              {errors.firstName && (
                <HelperText type="error">{errors.firstName}</HelperText>
              )}
              {errors.lastName && (
                <HelperText type="error">{errors.lastName}</HelperText>
              )}

              <TextInput
                style={styles.input}
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
              />
              {errors.email && (
                <HelperText type="error">{errors.email}</HelperText>
              )}

              {/* ID Fields */}
              {formData.role === UserRole.STUDENT ? (
                <>
                  <TextInput
                    style={styles.input}
                    label="Student ID"
                    value={formData.studentId || ''}
                    onChangeText={(text) => updateFormData('studentId', text)}
                    error={!!errors.studentId}
                    left={<TextInput.Icon icon="card-account-details" />}
                  />
                  {errors.studentId && (
                    <HelperText type="error">{errors.studentId}</HelperText>
                  )}
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    label="Employee ID"
                    value={formData.employeeId || ''}
                    onChangeText={(text) => updateFormData('employeeId', text)}
                    error={!!errors.employeeId}
                    left={<TextInput.Icon icon="badge-account" />}
                  />
                  {errors.employeeId && (
                    <HelperText type="error">{errors.employeeId}</HelperText>
                  )}
                </>
              )}

              {/* Password Fields */}
              <Text style={styles.sectionTitle}>Security</Text>
              
              <TextInput
                style={styles.input}
                label="Password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
              />
              {errors.password && (
                <HelperText type="error">{errors.password}</HelperText>
              )}

              <TextInput
                style={styles.input}
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
              />
              {errors.confirmPassword && (
                <HelperText type="error">{errors.confirmPassword}</HelperText>
              )}
            </Card.Content>
          </Card>

          {/* Register Button */}
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            contentStyle={styles.registerButtonContent}
          >
            {loading ? (
              <ActivityIndicator animating={true} color="white" />
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              compact
            >
              Sign In
            </Button>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 5,
  },
  formCard: {
    margin: 20,
    borderRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 2,
  },
  roleCardSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  roleInfo: {
    alignItems: 'center',
    marginLeft: 10,
  },
  roleText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginBottom: 5,
  },
  input: {
    marginBottom: 5,
  },
  registerButton: {
    margin: 20,
    borderRadius: 25,
    elevation: 3,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 16,
  },
});