import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Title,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons 
              name="school" 
              size={120} 
              color="white" 
            />
            <Title style={styles.title}>Smart Attendance</Title>
            <Paragraph style={styles.subtitle}>
              GPS-based attendance tracking for modern education
            </Paragraph>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="map-marker-check" size={24} color="white" />
              <Text style={styles.featureText}>Location-based verification</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
              <Text style={styles.featureText}>QR code scanning</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="chart-line" size={24} color="white" />
              <Text style={styles.featureText}>Real-time analytics</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={[styles.button, styles.loginButton]}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Register')}
              style={[styles.button, styles.registerButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.registerButtonText}
            >
              Create Account
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text 
                style={styles.link} 
                onPress={() => navigation.navigate('TermsAndPrivacy')}
              >
                Terms of Service and Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    marginVertical: 8,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: 'white',
  },
  registerButton: {
    borderColor: 'white',
    borderWidth: 2,
  },
  registerButtonText: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: 'white',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});