import React from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';

interface SafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  name?: string;
}

interface SafeWrapperState {
  hasError: boolean;
  error?: Error;
}

class SafeWrapper extends React.Component<SafeWrapperProps, SafeWrapperState> {
  constructor(props: SafeWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.name || 'SafeWrapper'}:`, error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
            Something went wrong in {this.props.name || 'this section'}
          </Text>
          <Button mode="contained" onPress={this.resetError}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

export default SafeWrapper;
