import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import {
  Text,
  Button,
  Title,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  const handleSignIn = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleSignUp = () => {
    navigation.navigate('Auth', { screen: 'Register' });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Title style={styles.title}>GPS Attendance</Title>
              <Text style={styles.subtitle}>
                Track attendance with precision using GPS technology
              </Text>
            </View>

            <View style={styles.features}>
              <Surface style={styles.featureCard}>
                <Text style={styles.featureIcon}>📍</Text>
                <Text style={styles.featureText}>GPS-based verification</Text>
              </Surface>
              <Surface style={styles.featureCard}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureText}>Real-time updates</Text>
              </Surface>
              <Surface style={styles.featureCard}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>Secure & reliable</Text>
              </Surface>
            </View>

            <View style={styles.buttons}>
              <Button
                mode="contained"
                onPress={handleSignIn}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Sign In
              </Button>
              <Button
                mode="outlined"
                onPress={handleSignUp}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.registerButtonLabel}
              >
                Create Account
              </Button>
              
              <Text style={styles.footer}>
                By continuing, you agree to our Terms of Service
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  features: {
    marginVertical: 30,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttons: {
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    marginBottom: 15,
  },
  registerButton: {
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 12,
  },
});
