import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import apiService from '@/services/api.service';

interface ResetPasswordScreenProps {
  navigation: any;
  route?: {
    params?: {
      token?: string;
    };
  };
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
  const [token, setToken] = useState(route?.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    // Handle deep link when component mounts
    handleDeepLink();
    
    // Listen for URL changes while the app is running
    const subscription = Linking.addEventListener('url', handleDeepLinkEvent);
    
    return () => subscription?.remove();
  }, []);

  const handleDeepLinkEvent = (event: { url: string }) => {
    const url = Linking.parse(event.url);
    if (url.queryParams?.token) {
      setToken(url.queryParams.token as string);
    }
  };

  const handleDeepLink = async () => {
    const url = await Linking.getInitialURL();
    if (url) {
      const parsed = Linking.parse(url);
      if (parsed.queryParams?.token) {
        setToken(parsed.queryParams.token as string);
      }
    }
  };

  const validateToken = (token: string) => {
    if (!token.trim()) {
      setTokenError('Reset token is required');
      return false;
    }
    setTokenError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleResetPassword = async () => {
    const isTokenValid = validateToken(token);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isTokenValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.resetPassword(token, password);
      setIsReset(true);
      
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successfully',
        text2: 'You can now sign in with your new password',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Password Reset Failed',
        text2: error.response?.data?.message || 'Invalid or expired token',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={64} 
                    color="#4CAF50" 
                  />
                </View>
                
                <Title style={styles.title}>Password Reset Successfully!</Title>
                <Text style={styles.message}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </Text>
                
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Continue to Sign In
                </Button>
              </Card.Content>
            </Card>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name="lock-reset" 
                    size={64} 
                    color="#667eea" 
                  />
                </View>
                
                <Title style={styles.title}>Reset Your Password</Title>
                <Text style={styles.message}>
                  Enter your reset token and choose a new password for your account.
                </Text>

                <TextInput
                  label="Reset Token"
                  value={token}
                  onChangeText={(text) => {
                    setToken(text);
                    if (tokenError) validateToken(text);
                  }}
                  onBlur={() => validateToken(token)}
                  mode="outlined"
                  error={!!tokenError}
                  style={styles.input}
                  left={<TextInput.Icon icon="key" />}
                  placeholder="Enter reset token from email"
                />
                <HelperText type="error" visible={!!tokenError}>
                  {tokenError}
                </HelperText>

                <TextInput
                  label="New Password"
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
                  placeholder="Enter new password"
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

                <TextInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) validateConfirmPassword(text);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  error={!!confirmPasswordError}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" />}
                  placeholder="Confirm new password"
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
                <HelperText type="error" visible={!!confirmPasswordError}>
                  {confirmPasswordError}
                </HelperText>

                <Text style={styles.requirements}>
                  Password Requirements:
                  {'\n'}• At least 8 characters
                  {'\n'}• Include uppercase and lowercase letters
                  {'\n'}• Include at least one number
                </Text>

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backButton}
                >
                  Back to Sign In
                </Button>
              </Card.Content>
            </Card>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  input: {
    marginBottom: 5,
  },
  button: {
    borderRadius: 25,
    marginTop: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
  },
  requirements: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    lineHeight: 18,
  },
});
