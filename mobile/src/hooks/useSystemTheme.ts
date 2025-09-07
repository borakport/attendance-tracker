import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAppSelector } from './redux';
import { lightTheme, darkTheme } from '@/constants/theme';

export interface UseSystemThemeReturn {
  theme: typeof lightTheme | typeof darkTheme;
  systemColorScheme: ColorSchemeName;
  isDarkMode: boolean;
  isAutoMode: boolean;
}

/**
 * Custom hook for managing system theme detection and app theme switching
 * Automatically switches between light and dark themes based on system settings
 * when the app theme mode is set to 'auto'
 */
export const useSystemTheme = (): UseSystemThemeReturn => {
  const { theme: themeMode } = useAppSelector((state) => state.ui);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Determine the current theme based on app settings and system preference
  const getTheme = () => {
    if (themeMode === 'auto') {
      // Use system preference when auto mode is selected
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getTheme();
  const isDarkMode = theme.dark || false;
  const isAutoMode = themeMode === 'auto';

  return {
    theme,
    systemColorScheme,
    isDarkMode,
    isAutoMode,
  };
};

/**
 * Hook to get the current system color scheme without theme logic
 * Useful for components that need to know the system preference
 */
export const useSystemColorScheme = (): ColorSchemeName => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  return colorScheme;
};

export default useSystemTheme;
