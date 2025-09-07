declare module 'react-native-safe-area-context' {
  import { ReactNode } from 'react';
  import { ViewStyle, ViewProps } from 'react-native';

  export interface SafeAreaProviderProps {
    children: ReactNode;
  }

  export interface SafeAreaViewProps extends ViewProps {
    children: ReactNode;
  }

  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export function SafeAreaProvider(props: SafeAreaProviderProps): JSX.Element;
  export function SafeAreaView(props: SafeAreaViewProps): JSX.Element;
  export function useSafeAreaInsets(): EdgeInsets;
}
