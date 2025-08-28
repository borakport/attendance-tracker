import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Title,
  ActivityIndicator,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { joinCourse } from '@/store/slices/courseSlice';

export default function JoinCourseScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.course);
  const [courseCode, setCourseCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [codeError, setCodeError] = useState('');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const validateCode = (code: string) => {
    if (!code) {
      setCodeError('Course code is required');
      return false;
    }
    if (code.length < 6) {
      setCodeError('Course code must be at least 6 characters');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleJoinCourse = async () => {
    if (!validateCode(courseCode)) {
      return;
    }

    try {
      const result = await dispatch(joinCourse(courseCode)).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `Joined ${result?.name || 'course'}`,
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to join course',
        text2: error.message || 'Invalid course code',
      });
    }
  };

  const handleBarCodeScanned = ({ type, data }: any) => {
    if (!scanned) {
      setScanned(true);
      setShowScanner(false);
      setCourseCode(data);
      Toast.show({
        type: 'info',
        text1: 'Code Scanned',
        text2: 'Course code captured from QR',
      });
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (showScanner && permission?.granted) {
    return (
      <SafeAreaView style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'code39'],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <Button
                mode="contained"
                onPress={() => {
                  setShowScanner(false);
                  setScanned(false);
                }}
                style={styles.closeScannerButton}
              >
                Close Scanner
              </Button>
            </View>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scannerText}>
              Align QR code within frame
            </Text>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="qrcode-scan" 
                  size={64} 
                  color="#667eea" 
                />
              </View>
              
              <Title style={styles.title}>Join a Course</Title>
              <Text style={styles.subtitle}>
                Enter the course code provided by your instructor
              </Text>

              <TextInput
                label="Course Code"
                value={courseCode}
                onChangeText={setCourseCode}
                mode="outlined"
                autoCapitalize="characters"
                autoCorrect={false}
                error={!!codeError}
                style={styles.input}
                left={<TextInput.Icon icon="key-variant" />}
              />
              <HelperText type="error" visible={!!codeError}>
                {codeError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleJoinCourse}
                disabled={loading}
                style={styles.joinButton}
                contentStyle={styles.buttonContent}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Join Course'
                )}
              </Button>

              {permission?.granted && (
                <Button
                  mode="outlined"
                  onPress={() => setShowScanner(true)}
                  style={styles.scanButton}
                  icon="qrcode-scan"
                >
                  Scan QR Code
                </Button>
              )}

              <View style={styles.helpSection}>
                <MaterialCommunityIcons name="information" size={20} color="#666" />
                <Text style={styles.helpText}>
                  Course codes are case-sensitive and typically 6-10 characters long
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    borderRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  input: {
    marginBottom: 8,
  },
  joinButton: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: '#667eea',
  },
  scanButton: {
    marginTop: 12,
    borderRadius: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    fontSize: 13,
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scannerHeader: {
    padding: 20,
    alignItems: 'center',
  },
  closeScannerButton: {
    backgroundColor: 'white',
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 50,
  },
});
