import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Dialog,
  Portal,
  Text,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';

interface PasswordVerificationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onVerify: (password: string) => Promise<void>;
  onDismiss: () => void;
  loading?: boolean;
}

export default function PasswordVerificationDialog({
  visible,
  title,
  message,
  onVerify,
  onDismiss,
  loading = false,
}: PasswordVerificationDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await onVerify(password);
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid password');
    }
  };

  const handleDismiss = () => {
    setPassword('');
    setError('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            mode="outlined"
            error={!!error}
            style={styles.input}
            autoFocus
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={handleVerify} loading={loading} disabled={loading}>
            Verify
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  message: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    marginBottom: 8,
  },
});
