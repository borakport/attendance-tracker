import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Title,
  Paragraph,
  Divider,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export default function TermsScreen({ navigation }: any) {
  const lastUpdated = new Date('2024-01-01');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Title style={styles.title}>Terms of Service</Title>
          <Text style={styles.lastUpdated}>
            Last updated: {format(lastUpdated, 'MMMM dd, yyyy')}
          </Text>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>1. Acceptance of Terms</Title>
          <Paragraph style={styles.paragraph}>
            By accessing and using the GPS Attendance System ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, please do not use the Service.
          </Paragraph>

          <Title style={styles.sectionTitle}>2. Service Description</Title>
          <Paragraph style={styles.paragraph}>
            GPS Attendance System is a location-based attendance tracking application designed for educational institutions. 
            The Service allows instructors to create courses and sessions, and enables students to mark their attendance 
            using GPS verification within specified geographic boundaries.
          </Paragraph>

          <Title style={styles.sectionTitle}>3. User Responsibilities</Title>
          <Paragraph style={styles.paragraph}>
            <Text style={styles.bold}>As a Student:</Text>
            {'\n'}• You must provide accurate location data when marking attendance
            {'\n'}• You may not falsify your location or use location spoofing tools
            {'\n'}• You must mark your own attendance and not on behalf of others
            {'\n'}• You are responsible for ensuring your device's GPS is functional
            {'\n\n'}
            <Text style={styles.bold}>As an Instructor:</Text>
            {'\n'}• You must set reasonable GPS radius boundaries for sessions
            {'\n'}• You are responsible for managing course and session settings accurately
            {'\n'}• You must respect student privacy when viewing attendance data
          </Paragraph>

          <Title style={styles.sectionTitle}>4. Location Data Usage</Title>
          <Paragraph style={styles.paragraph}>
            The Service collects and uses location data solely for attendance verification purposes. 
            Location data is:
            {'\n'}• Only collected when you actively mark attendance
            {'\n'}• Stored securely and associated with attendance records
            {'\n'}• Not shared with third parties except as required by law
            {'\n'}• Retained only for the duration of the academic term
          </Paragraph>

          <Title style={styles.sectionTitle}>5. Account Security</Title>
          <Paragraph style={styles.paragraph}>
            You are responsible for:
            {'\n'}• Maintaining the confidentiality of your account credentials
            {'\n'}• All activities that occur under your account
            {'\n'}• Notifying us immediately of any unauthorized use
            {'\n'}• Ensuring your account information is accurate and up-to-date
          </Paragraph>

          <Title style={styles.sectionTitle}>6. Prohibited Activities</Title>
          <Paragraph style={styles.paragraph}>
            You may not:
            {'\n'}• Use the Service for any illegal or unauthorized purpose
            {'\n'}• Attempt to gain unauthorized access to any part of the Service
            {'\n'}• Interfere with or disrupt the Service or servers
            {'\n'}• Use automated systems to access the Service
            {'\n'}• Share attendance codes with unauthorized individuals
          </Paragraph>

          <Title style={styles.sectionTitle}>7. Intellectual Property</Title>
          <Paragraph style={styles.paragraph}>
            All content, features, and functionality of the Service are owned by GPS Attendance System 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </Paragraph>

          <Title style={styles.sectionTitle}>8. Limitation of Liability</Title>
          <Paragraph style={styles.paragraph}>
            The Service is provided "as is" without warranties of any kind. We shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages resulting from your use of or 
            inability to use the Service.
          </Paragraph>

          <Title style={styles.sectionTitle}>9. Changes to Terms</Title>
          <Paragraph style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of any material 
            changes via email or through the Service. Your continued use of the Service after such modifications 
            constitutes acceptance of the updated Terms.
          </Paragraph>

          <Title style={styles.sectionTitle}>10. Contact Information</Title>
          <Paragraph style={styles.paragraph}>
            For questions about these Terms, please contact us at:
            {'\n'}Email: support@gpsattendance.com
            {'\n'}Address: 123 Education Ave, Learning City, LC 12345
          </Paragraph>

          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            I Understand
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  divider: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#667eea',
  },
});
