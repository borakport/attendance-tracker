import React from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Text, 
  Title, 
  Surface, 
  IconButton,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function TermsAndPrivacyScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Surface style={styles.container}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Title style={styles.title}>Terms of Service & Privacy Policy</Title>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* TERMS OF SERVICE SECTION */}
            <Title style={styles.mainSectionTitle}>TERMS OF SERVICE</Title>
            
            <Title style={styles.sectionTitle}>1. Acceptance of Terms</Title>
            <Text style={styles.paragraph}>
              By accessing and using the GPS Attendance System ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use the Service.
            </Text>

            <Title style={styles.sectionTitle}>2. Service Description</Title>
            <Text style={styles.paragraph}>
              GPS Attendance is a location-based attendance tracking system designed for educational institutions. 
              The Service allows instructors to track student attendance using GPS location verification.
            </Text>

            <Title style={styles.sectionTitle}>3. User Responsibilities</Title>
            <Text style={styles.paragraph}>
              As a user of the Service, you agree to:
              {'\n'}• Provide accurate and current information during registration
              {'\n'}• Maintain the security of your account credentials
              {'\n'}• Use the Service only for legitimate educational purposes
              {'\n'}• Respect the privacy and rights of other users
              {'\n'}• Comply with all applicable laws and regulations
              {'\n'}• Report any security vulnerabilities or misuse
            </Text>

            <Title style={styles.sectionTitle}>4. Instructor Responsibilities</Title>
            <Text style={styles.paragraph}>
              Instructors using the Service must:
              {'\n'}• Create courses and sessions only for legitimate educational purposes
              {'\n'}• Set reasonable GPS boundaries for attendance marking
              {'\n'}• Respect student privacy when viewing attendance data
              {'\n'}• Use attendance data only for educational evaluation
              {'\n'}• Maintain confidentiality of student information
            </Text>

            <Title style={styles.sectionTitle}>5. Student Responsibilities</Title>
            <Text style={styles.paragraph}>
              Students using the Service must:
              {'\n'}• Attend classes physically to mark attendance legitimately
              {'\n'}• Not attempt to circumvent GPS location verification
              {'\n'}• Report any technical issues promptly
              {'\n'}• Use the Service only for attending enrolled courses
            </Text>

            <Title style={styles.sectionTitle}>6. Location Data Usage</Title>
            <Text style={styles.paragraph}>
              The Service requires access to your device's location for attendance verification. 
              Location data is used solely for:
              {'\n'}• Verifying your presence at class sessions
              {'\n'}• Calculating distance from designated class locations
              {'\n'}• Maintaining attendance records
            </Text>

            <Title style={styles.sectionTitle}>7. Prohibited Activities</Title>
            <Text style={styles.paragraph}>
              You may not use the Service to:
              {'\n'}• Submit false or fraudulent attendance records
              {'\n'}• Attempt to manipulate location data or GPS signals
              {'\n'}• Access or attempt to access other users' accounts
              {'\n'}• Interfere with the proper functioning of the Service
              {'\n'}• Use the Service for any illegal or unauthorized purpose
            </Text>

            <Title style={styles.sectionTitle}>8. Service Availability</Title>
            <Text style={styles.paragraph}>
              We strive to maintain high service availability but cannot guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </Text>

            <Title style={styles.sectionTitle}>9. Changes to Terms</Title>
            <Text style={styles.paragraph}>
              We reserve the right to modify these Terms at any time. We will notify users of any material 
              changes through the Service or via email. Continued use of the Service after changes 
              constitutes acceptance of the updated Terms.
            </Text>

            <Title style={styles.sectionTitle}>10. Contact Information</Title>
            <Text style={styles.paragraph}>
              For questions about these Terms, please contact us at:
              {'\n'}Email: support@gpsattendance.com
              {'\n'}Website: www.gpsattendance.com
            </Text>

            <Divider style={styles.divider} />

            {/* PRIVACY POLICY SECTION */}
            <Title style={styles.mainSectionTitle}>PRIVACY POLICY</Title>

            <Title style={styles.sectionTitle}>1. Information We Collect</Title>
            <Text style={styles.paragraph}>
              We collect the following types of information:
              {'\n'}• Account information (name, email, phone number)
              {'\n'}• Location data for attendance verification
              {'\n'}• Course enrollment and attendance records
              {'\n'}• Device information (for security and optimization)
              {'\n'}• Usage data (for service improvement)
            </Text>

            <Title style={styles.sectionTitle}>2. How We Use Your Information</Title>
            <Text style={styles.paragraph}>
              We use your information to:
              {'\n'}• Provide and maintain the attendance tracking service
              {'\n'}• Verify your identity and secure your account
              {'\n'}• Track and record attendance for enrolled courses
              {'\n'}• Communicate important service updates
              {'\n'}• Improve our service quality and user experience
              {'\n'}• Comply with legal requirements
            </Text>

            <Title style={styles.sectionTitle}>3. Location Data Privacy</Title>
            <Text style={styles.paragraph}>
              Your location data is:
              {'\n'}• Collected only when marking attendance
              {'\n'}• Used solely for distance calculation and verification
              {'\n'}• Stored securely with encryption
              {'\n'}• Not shared with third parties without consent
              {'\n'}• Automatically deleted after academic term completion
            </Text>

            <Title style={styles.sectionTitle}>4. Data Sharing</Title>
            <Text style={styles.paragraph}>
              We do not sell or rent your personal information. We may share data only:
              {'\n'}• With your educational institution for academic purposes
              {'\n'}• With instructors for courses you're enrolled in
              {'\n'}• When required by law or legal process
              {'\n'}• To protect the safety and security of our users
            </Text>

            <Title style={styles.sectionTitle}>5. Data Security</Title>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures including:
              {'\n'}• Encryption of data in transit and at rest
              {'\n'}• Secure authentication and authorization
              {'\n'}• Regular security audits and updates
              {'\n'}• Access controls and monitoring systems
            </Text>

            <Title style={styles.sectionTitle}>6. Your Rights</Title>
            <Text style={styles.paragraph}>
              You have the right to:
              {'\n'}• Access your personal data and attendance records
              {'\n'}• Request correction of inaccurate information
              {'\n'}• Request deletion of your data (subject to academic requirements)
              {'\n'}• Withdraw consent for optional data processing
              {'\n'}• Export your data in a portable format
            </Text>

            <Title style={styles.sectionTitle}>7. Children's Privacy</Title>
            <Text style={styles.paragraph}>
              Our Service is designed for users 13 years and older. If we learn that we have 
              collected information from a child under 13, we will delete that information promptly.
            </Text>

            <Title style={styles.sectionTitle}>8. International Data Transfers</Title>
            <Text style={styles.paragraph}>
              If you access our Service from outside our primary jurisdiction, your data may be 
              transferred and processed in different countries. 
              We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </Text>

            <Title style={styles.sectionTitle}>9. Changes to Privacy Policy</Title>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. We will notify you of any material changes 
              through the Service or via email. Your continued use constitutes acceptance of the updated policy.
            </Text>

            <Title style={styles.sectionTitle}>10. Contact Us</Title>
            <Text style={styles.paragraph}>
              For privacy-related questions or concerns:
              {'\n'}Email: privacy@gpsattendance.com
              {'\n'}Phone: +1 (555) 123-4567
              {'\n'}Address: 123 Education Blvd, Tech City, TC 12345
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Last updated: August 29, 2025
              </Text>
              <Text style={styles.footerText}>
                GPS Attendance Tracker v1.1
              </Text>
            </View>
          </ScrollView>
        </Surface>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = {
  container: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginRight: 40, // Compensate for back button
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1976d2',
    textAlign: 'center' as const,
    marginVertical: 20,
    textDecorationLine: 'underline' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 12,
    textAlign: 'justify' as const,
  },
  divider: {
    marginVertical: 30,
    height: 2,
    backgroundColor: '#1976d2',
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginVertical: 2,
  },
};
