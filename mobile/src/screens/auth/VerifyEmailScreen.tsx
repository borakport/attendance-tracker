import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
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
import apiService from '@/services/api.service';

interface VerifyEmailScreenProps {
  navigation: any;
  route?: {
    params?: {
      token?: string;
      email?: string;
      phoneNumber?: string;
      userId?: string;
    };
  };
}

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(route?.params?.phoneNumber || '');
  const [userId, setUserId] = useState(route?.params?.userId || '');
  const [phoneCode, setPhoneCode] = useState('');
  const [token, setToken] = useState(route?.params?.token || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(!route?.params?.phoneNumber);
  const [isVerified, setIsVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneCodeError, setPhoneCodeError] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    // Handle deep link when component mounts
    handleDeepLink();
    
    // Listen for URL changes while the app is running
    const subscription = Linking.addEventListener('url', handleDeepLinkEvent);
    
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Auto-verify if token is provided via deep link
    if (token && !isVerified) {
      handleVerifyEmail();
    }
  }, [token]);

  const handleDeepLinkEvent = (event: { url: string }) => {
    const url = new URL(event.url);
    const tokenParam = url.searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  };

  const handleDeepLink = async () => {
    const url = await Linking.getInitialURL();
    if (url) {
      const parsed = new URL(url);
      const tokenParam = parsed.searchParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
      }
    }
  };

  const validateToken = (token: string) => {
    if (!token.trim()) {
      setTokenError('Verification token is required');
      return false;
    }
    setTokenError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhoneCode = (code: string) => {
    if (!code.trim()) {
      setPhoneCodeError('Verification code is required');
      return false;
    }
    if (!/^\d{6}$/.test(code)) {
      setPhoneCodeError('Code must be 6 digits');
      return false;
    }
    setPhoneCodeError('');
    return true;
  };

  const handleVerifyEmail = async () => {
    if (!validateToken(token)) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.verifyEmail(token);
      setIsVerified(true);
      
      Toast.show({
        type: 'success',
        text1: 'Email Verified Successfully',
        text2: 'You can now sign in to your account',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.response?.data?.message || 'Invalid or expired token',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      // Note: You might need to add a resend endpoint to your API
      await apiService.signUp({
        email,
        password: '', // Not needed for resend
        firstName: '',
        lastName: '',
        role: 'student'
      });
      
      Toast.show({
        type: 'success',
        text1: 'Verification Email Sent',
        text2: 'Please check your email for the verification link',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to resend email',
        text2: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!validatePhoneCode(phoneCode)) {
      return;
    }

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User ID not found. Please try registering again.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.verifyPhone(userId, phoneCode);
      setIsPhoneVerified(true);
      
      Toast.show({
        type: 'success',
        text1: 'Phone Verified Successfully',
        text2: 'Your phone number has been verified',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.response?.data?.message || 'Invalid or expired code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPhoneCode = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User ID not found. Please try registering again.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.resendPhoneVerification(userId);
      
      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'A new verification code has been sent to your phone',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to resend code',
        text2: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified && isPhoneVerified) {
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
                
                <Title style={styles.title}>
                  {phoneNumber ? 'Account Verified!' : 'Email Verified!'}
                </Title>
                <Text style={styles.message}>
                  {phoneNumber 
                    ? 'Your email and phone number have been successfully verified. You can now sign in to your account.'
                    : 'Your email has been successfully verified. You can now sign in to your account.'
                  }
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
                    name="email-check-outline" 
                    size={64} 
                    color="#667eea" 
                  />
                </View>
                
                <Title style={styles.title}>
                  {phoneNumber ? 'Verify Your Account' : 'Verify Your Email'}
                </Title>
                <Text style={styles.message}>
                  {phoneNumber 
                    ? 'Enter the verification token from your email and SMS code from your phone.'
                    : 'Enter the verification token from your email or paste the verification link.'
                  }
                </Text>

                <TextInput
                  label="Verification Token"
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
                  placeholder="Enter verification token"
                />
                <HelperText type="error" visible={!!tokenError}>
                  {tokenError}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleVerifyEmail}
                  disabled={isLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.resendText}>
                  Didn't receive the email?
                </Text>

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
                  error={!!emailError}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                  placeholder="Enter your email"
                />
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>

                <Button
                  mode="outlined"
                  onPress={handleResendVerification}
                  disabled={isLoading}
                  style={styles.resendButton}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#667eea" />
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                {/* Phone Verification Section - Only show if phone number provided */}
                {phoneNumber && !isPhoneVerified && (
                  <>
                    <Text style={[styles.message, { marginTop: 24, marginBottom: 16 }]}>
                      Please also verify your phone number by entering the 6-digit code sent to {phoneNumber}
                    </Text>

                    <TextInput
                      label="Phone Verification Code"
                      value={phoneCode}
                      onChangeText={(text) => {
                        setPhoneCode(text);
                        if (phoneCodeError) validatePhoneCode(text);
                      }}
                      onBlur={() => validatePhoneCode(phoneCode)}
                      mode="outlined"
                      keyboardType="numeric"
                      maxLength={6}
                      error={!!phoneCodeError}
                      style={styles.input}
                      left={<TextInput.Icon icon="cellphone" />}
                      placeholder="Enter 6-digit code"
                    />
                    <HelperText type="error" visible={!!phoneCodeError}>
                      {phoneCodeError}
                    </HelperText>

                    <Button
                      mode="contained"
                      onPress={handleVerifyPhone}
                      disabled={isLoading}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                    >
                      {isLoading ? <ActivityIndicator color="white" /> : 'Verify Phone'}
                    </Button>

                    <Button
                      mode="outlined"
                      onPress={handleResendPhoneCode}
                      disabled={isLoading}
                      style={styles.resendButton}
                      contentStyle={styles.buttonContent}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#667eea" />
                      ) : (
                        'Resend Phone Code'
                      )}
                    </Button>
                  </>
                )}

                {/* Success message when phone is verified */}
                {phoneNumber && isPhoneVerified && (
                  <Text style={[styles.message, { marginTop: 16, color: '#4CAF50' }]}>
                    ✅ Phone number verified successfully!
                  </Text>
                )}

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
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    borderRadius: 25,
    marginTop: 10,
    borderColor: '#667eea',
  },
  backButton: {
    marginTop: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  resendText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    fontSize: 14,
  },
});
