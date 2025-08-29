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

export default function PrivacyScreen({ navigation }: any) {
  const lastUpdated = new Date('2024-01-01');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Title style={styles.title}>Privacy Policy</Title>
          <Text style={styles.lastUpdated}>
            Last updated: {format(lastUpdated, 'MMMM dd, yyyy')}
          </Text>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>1. Information We Collect</Title>
          <Paragraph style={styles.paragraph}>
            <Text style={styles.bold}>Personal Information:</Text>
            {'\n'}• Name and email address
            {'\n'}• Phone number (optional)
            {'\n'}• User role (Student/Instructor)
            {'\n'}• Profile photo (optional)
            {'\n\n'}
            <Text style={styles.bold}>Location Data:</Text>
            {'\n'}• GPS coordinates when marking attendance
            {'\n'}• Timestamp of location capture
            {'\n'}• Location accuracy information
            {'\n\n'}
            <Text style={styles.bold}>Device Information:</Text>
            {'\n'}• Device type and model
            {'\n'}• Operating system version
            {'\n'}• App version
            {'\n'}• Device identifiers for push notifications
          </Paragraph>

          <Title style={styles.sectionTitle}>2. How We Use Your Information</Title>
          <Paragraph style={styles.paragraph}>
            We use collected information to:
            {'\n'}• Verify attendance based on GPS location
            {'\n'}• Provide course and session management features
            {'\n'}• Send notifications about sessions and attendance
            {'\n'}• Generate attendance reports and analytics
            {'\n'}• Improve and optimize the Service
            {'\n'}• Comply with legal obligations
          </Paragraph>

          <Title style={styles.sectionTitle}>3. Location Data Privacy</Title>
          <Paragraph style={styles.paragraph}>
            Location data is particularly sensitive, and we handle it with extra care:
            {'\n'}• Location is only accessed when you actively mark attendance
            {'\n'}• We do not track your location in the background
            {'\n'}• Location data is encrypted during transmission and storage
            {'\n'}• Historical location data is deleted after the academic term ends
            {'\n'}• You can deny location permissions, but this will prevent attendance marking
          </Paragraph>

          <Title style={styles.sectionTitle}>4. Data Sharing and Disclosure</Title>
          <Paragraph style={styles.paragraph}>
            We do not sell, trade, or rent your personal information. We may share information:
            {'\n'}• With instructors: Students' attendance records for their courses
            {'\n'}• With institution administrators: Aggregate attendance statistics
            {'\n'}• With service providers: Who help us operate the Service (under strict confidentiality)
            {'\n'}• As required by law: To comply with legal obligations or protect rights
          </Paragraph>

          <Title style={styles.sectionTitle}>5. Data Security</Title>
          <Paragraph style={styles.paragraph}>
            We implement industry-standard security measures including:
            {'\n'}• Encryption of data in transit and at rest
            {'\n'}• Secure authentication with JWT tokens
            {'\n'}• Regular security audits and updates
            {'\n'}• Limited access to personal information
            {'\n'}• Secure cloud infrastructure with regular backups
          </Paragraph>

          <Title style={styles.sectionTitle}>6. Your Rights and Choices</Title>
          <Paragraph style={styles.paragraph}>
            You have the right to:
            {'\n'}• Access your personal information
            {'\n'}• Request correction of inaccurate data
            {'\n'}• Request deletion of your account and data
            {'\n'}• Opt-out of non-essential notifications
            {'\n'}• Export your attendance records
            {'\n'}• Withdraw consent for data processing
          </Paragraph>

          <Title style={styles.sectionTitle}>7. Children's Privacy</Title>
          <Paragraph style={styles.paragraph}>
            The Service is intended for use in educational institutions. If users under 18 use the Service, 
            it should be with the consent and supervision of their educational institution and/or parents/guardians.
          </Paragraph>

          <Title style={styles.sectionTitle}>8. International Data Transfers</Title>
          <Paragraph style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </Paragraph>

          <Title style={styles.sectionTitle}>9. Changes to Privacy Policy</Title>
          <Paragraph style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will notify you of any material changes 
            through the app or via email. Your continued use of the Service after changes constitutes 
            acceptance of the updated policy.
          </Paragraph>

          <Title style={styles.sectionTitle}>10. Contact Us</Title>
          <Paragraph style={styles.paragraph}>
            For privacy-related questions or concerns:
            {'\n'}Email: privacy@gpsattendance.com
            {'\n'}Data Protection Officer: dpo@gpsattendance.com
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
