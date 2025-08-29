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
  Checkbox,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch } from '@/hooks/redux';
import { signIn } from '@/store/slices/authSlice';
import Toast from 'react-native-toast-message';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await dispatch(signIn({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });

      // Navigation will be handled by auth state change
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Please check your credentials and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof LoginFormData, value: string | boolean) => {
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
              name="school" 
              size={80} 
              color="white" 
            />
            <Title style={styles.headerTitle}>Smart Attendance</Title>
            <Paragraph style={styles.headerSubtitle}>
              Sign in to your account
            </Paragraph>
          </LinearGradient>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your account
              </Text>

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

              <TextInput
                style={styles.input}
                label="Password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && (
                <HelperText type="error">{errors.password}</HelperText>
              )}

              {/* Remember Me */}
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={formData.rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => updateFormData('rememberMe', !formData.rememberMe)}
                />
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            {loading ? (
              <ActivityIndicator animating={true} color="white" />
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Quick Access Section */}
          <Card style={styles.quickAccessCard}>
            <Card.Content>
              <Text style={styles.quickAccessTitle}>Quick Access</Text>
              <View style={styles.quickAccessButtons}>
                <Button
                  mode="outlined"
                  icon="qrcode-scan"
                  onPress={() => {
                    // Handle guest QR scan
                    Toast.show({
                      type: 'info',
                      text1: 'Guest Access',
                      text2: 'Please sign in for full access',
                    });
                  }}
                  style={styles.quickAccessButton}
                >
                  Scan QR
                </Button>
                <Button
                  mode="outlined"
                  icon="help-circle"
                  onPress={() => {
                    // Navigate to help/support
                    Toast.show({
                      type: 'info',
                      text1: 'Help & Support',
                      text2: 'Contact your administrator for assistance',
                    });
                  }}
                  style={styles.quickAccessButton}
                >
                  Help
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Register Link */}
          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerLinkText}>Don't have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              compact
            >
              Sign Up
            </Button>
          </View>

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              compact
            >
              Forgot Password?
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
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 15,
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
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    color: '#666',
    marginBottom: 25,
    fontSize: 16,
  },
  input: {
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  loginButton: {
    margin: 20,
    borderRadius: 25,
    elevation: 3,
  },
  loginButtonContent: {
    paddingVertical: 10,
  },
  quickAccessCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 2,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerLinkText: {
    color: '#666',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});