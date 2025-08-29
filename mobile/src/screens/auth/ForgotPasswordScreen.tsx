import React, { useState } from 'react';
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
import apiService from '@/services/api.service';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

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

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
      setEmailSent(true);
      
      Toast.show({
        type: 'success',
        text1: 'Reset Email Sent',
        text2: 'Please check your email for password reset instructions',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send reset email',
        text2: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
                    name="email-check" 
                    size={64} 
                    color="#4CAF50" 
                  />
                </View>
                
                <Title style={styles.title}>Check Your Email</Title>
                <Text style={styles.message}>
                  We've sent password reset instructions to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                
                <Text style={styles.infoText}>
                  If you don't see the email, check your spam folder.
                </Text>
                
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.button}
                >
                  Back to Login
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  style={styles.linkButton}
                >
                  Try Different Email
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
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Forgot Password?</Title>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you instructions to reset your password
              </Text>
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name="lock-reset" 
                    size={64} 
                    color="#667eea" 
                  />
                </View>
                
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => validateEmail(email)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!emailError}
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>
                
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
                    'Send Reset Email'
                  )}
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                  style={styles.linkButton}
                >
                  Back to Login
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emailText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
  },
  infoText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 25,
    backgroundColor: '#667eea',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});
