import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
  Checkbox,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { signIn, clearError } from '@/store/slices/authSlice';
import { Config } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
        position: 'bottom',
      });
      dispatch(clearError());
    }
  }, [error]);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('@saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await dispatch(signIn({ email: email.toLowerCase().trim(), password })).unwrap();
      
      if (rememberMe) {
        await AsyncStorage.setItem('@saved_email', email);
      } else {
        await AsyncStorage.removeItem('@saved_email');
      }

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully signed in',
        position: 'top',
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const fillTestAccount = (type: 'student' | 'instructor') => {
    if (type === 'student') {
      setEmail('alice.smith@student.edu');
      setPassword('password123');
    } else {
      setEmail('prof.anderson@university.edu');
      setPassword('password123');
    }
    setEmailError('');
    setPasswordError('');
  };

  return (
    <LinearGradient
      colors={theme.dark ? ['#0F172A', '#1E293B'] : ['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Title style={[styles.title, { color: theme.dark ? '#F8FAFC' : 'white' }]}>
                Welcome Back
              </Title>
              <Text style={[styles.subtitle, { color: theme.dark ? '#E2E8F0' : 'rgba(255, 255, 255, 0.9)' }]}>
                Sign in to Smart Attendance
              </Text>
            </View>

            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onBlur={() => validateEmail(email)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  error={!!emailError}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                  placeholder="Enter your email"
                />
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  onBlur={() => validatePassword(password)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!passwordError}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  placeholder="Enter your password"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>

                <View style={styles.options}>
                  <View style={styles.rememberMe}>
                    <Checkbox
                      status={rememberMe ? 'checked' : 'unchecked'}
                      onPress={() => setRememberMe(!rememberMe)}
                    />
                    <Text style={{ color: theme.colors.onSurface }}>Remember me</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>OR</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                </View>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                    Don't have an account?
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.linkButton}
                  >
                    Sign Up
                  </Button>
                </View>

                {Config.APP.SHOW_TEST_ACCOUNTS && (
                  <View style={[styles.testAccounts, { 
                    backgroundColor: theme.dark ? 'rgba(59, 130, 246, 0.1)' : '#f5f5f5',
                    borderColor: theme.dark ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    borderWidth: theme.dark ? 1 : 0
                  }]}>
                    <Text style={[styles.testTitle, { color: theme.colors.onSurfaceVariant }]}>
                      🚀 Quick Test Login:
                    </Text>
                    <View style={styles.testButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => fillTestAccount('student')}
                        compact
                        style={styles.testButton}
                      >
                        Student
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => fillTestAccount('instructor')}
                        compact
                        style={styles.testButton}
                      >
                        Instructor
                      </Button>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 20,
    elevation: 5,
    maxWidth: width - 40,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    marginBottom: 5,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    fontWeight: 'bold',
  },
  loginButton: {
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
  linkButton: {
    marginLeft: 5,
  },
  testAccounts: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  testTitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButton: {
    flex: 0.45,
  },
});
