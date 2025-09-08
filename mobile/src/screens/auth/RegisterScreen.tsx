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
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { signUp, clearError } from '@/store/slices/authSlice';
import apiService from '@/services/api.service';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error,
        position: 'bottom',
      });
      dispatch(clearError());
    }
  }, [error]);

  const validateFirstName = (name: string) => {
    if (!name.trim()) {
      setFirstNameError('First name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      return false;
    }
    setFirstNameError('');
    return true;
  };

  const validateLastName = (name: string) => {
    if (!name.trim()) {
      setLastNameError('Last name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      return false;
    }
    setLastNameError('');
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

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    // Phone number is optional, only validate format if provided
    if (!phone.trim()) {
      setPhoneNumberError('');
      return true; // Valid when empty (optional field)
    }
    if (!phoneRegex.test(phone.trim())) {
      setPhoneNumberError('Please enter a valid phone number (e.g., +1234567890)');
      return false;
    }
    setPhoneNumberError('');
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

  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);
    const isPhoneNumberValid = validatePhoneNumber(phoneNumber);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
        !isPhoneNumberValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!agreeTerms) {
      Toast.show({
        type: 'error',
        text1: 'Terms Required',
        text2: 'Please agree to the terms and conditions',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare signup data - only include phone number if provided
      const signupData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      };
      
      // Only include phone number if user provided one
      if (phoneNumber.trim()) {
        signupData.phoneNumber = phoneNumber.trim();
      }
      
      // Call API directly for signup (don't auto-login)
      const response = await apiService.signUp(signupData);
      
      if (response.success) {
        const hasPhoneNumber = phoneNumber.trim();
        
        Toast.show({
          type: 'success',
          text1: 'Account Created!',
          text2: hasPhoneNumber 
            ? 'Please check your email and phone for verification codes'
            : 'Please check your email to verify your account',
          position: 'top',
        });
        
        // Navigate to email verification screen with conditional phone data
        const verificationData: any = { 
          email: email.toLowerCase().trim(),
          userId: response.data?.user?.id, // Add user ID for phone verification
        };
        
        if (hasPhoneNumber) {
          verificationData.phoneNumber = phoneNumber.trim();
        }
        
        navigation.navigate('VerifyEmail', verificationData);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error?.response?.data?.message || error?.message || 'Please check your connection and try again',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Title style={styles.title}>Create Account</Title>
              <Text style={styles.subtitle}>Join GPS Attendance today</Text>
            </View>

            <Card style={styles.card}>
              <Card.Content>
                {/* Role Selection */}
                <Text style={styles.sectionLabel}>I am a:</Text>
                <SegmentedButtons
                  value={role}
                  onValueChange={setRole}
                  buttons={[
                    { value: 'student', label: 'Student' },
                    { value: 'instructor', label: 'Instructor' },
                  ]}
                  style={styles.roleSelector}
                />

                {/* Name Fields */}
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <TextInput
                      label="First Name"
                      value={firstName}
                      onChangeText={setFirstName}
                      onBlur={() => validateFirstName(firstName)}
                      mode="outlined"
                      autoCapitalize="words"
                      error={!!firstNameError}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!firstNameError}>
                      {firstNameError}
                    </HelperText>
                  </View>
                  <View style={styles.nameField}>
                    <TextInput
                      label="Last Name"
                      value={lastName}
                      onChangeText={setLastName}
                      onBlur={() => validateLastName(lastName)}
                      mode="outlined"
                      autoCapitalize="words"
                      error={!!lastNameError}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={!!lastNameError}>
                      {lastNameError}
                    </HelperText>
                  </View>
                </View>

                {/* Email */}
                <TextInput
                  label="Email"
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

                {/* Phone Number */}
                <TextInput
                  label="Phone Number (Optional)"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onBlur={() => validatePhoneNumber(phoneNumber)}
                  mode="outlined"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!phoneNumberError}
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" />}
                  placeholder="+1234567890 (optional)"
                />
                <HelperText type="error" visible={!!phoneNumberError}>
                  {phoneNumberError}
                </HelperText>

                {/* Password */}
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => validatePassword(password)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!passwordError}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
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

                {/* Confirm Password */}
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  error={!!confirmPasswordError}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" />}
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

                {/* Terms Agreement */}
                <View style={styles.termsContainer}>
                  <Checkbox
                    status={agreeTerms ? 'checked' : 'unchecked'}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                  />
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text 
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('TermsAndPrivacy')}
                    >
                      Terms of Service and Privacy Policy
                    </Text>
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  disabled={isLoading}
                  style={styles.registerButton}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.linkButton}
                  >
                    Sign In
                  </Button>
                </View>
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
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    borderRadius: 20,
    elevation: 5,
    maxWidth: width - 40,
    alignSelf: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  roleSelector: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 0.48,
  },
  input: {
    marginBottom: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingRight: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  registerButton: {
    borderRadius: 25,
    backgroundColor: '#667eea',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  footerText: {
    color: '#666',
  },
  linkButton: {
    marginLeft: 5,
  },
});
