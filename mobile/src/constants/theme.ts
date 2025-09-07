import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Color Palette
export const ColorPalette = {
  // Primary Brand Colors
  primary: '#2563EB', // Blue 600
  primaryLight: '#3B82F6', // Blue 500
  primaryDark: '#1D4ED8', // Blue 700
  primaryContainer: '#DBEAFE', // Blue 100
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E3A8A', // Blue 800

  // Secondary Colors
  secondary: '#059669', // Emerald 600
  secondaryLight: '#10B981', // Emerald 500
  secondaryDark: '#047857', // Emerald 700
  secondaryContainer: '#D1FAE5', // Emerald 100
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#064E3B', // Emerald 800

  // Accent Colors
  accent: '#7C3AED', // Violet 600
  accentLight: '#8B5CF6', // Violet 500
  accentDark: '#6D28D9', // Violet 700
  accentContainer: '#EDE9FE', // Violet 100
  onAccent: '#FFFFFF',
  onAccentContainer: '#4C1D95', // Violet 800

  // Success Colors
  success: '#16A34A', // Green 600
  successLight: '#22C55E', // Green 500
  successDark: '#15803D', // Green 700
  successContainer: '#DCFCE7', // Green 100
  onSuccess: '#FFFFFF',
  onSuccessContainer: '#14532D', // Green 800

  // Warning Colors
  warning: '#EA580C', // Orange 600
  warningLight: '#F97316', // Orange 500
  warningDark: '#C2410C', // Orange 700
  warningContainer: '#FED7AA', // Orange 200
  onWarning: '#FFFFFF',
  onWarningContainer: '#9A3412', // Orange 800

  // Error Colors
  error: '#DC2626', // Red 600
  errorLight: '#EF4444', // Red 500
  errorDark: '#B91C1C', // Red 700
  errorContainer: '#FEE2E2', // Red 100
  onError: '#FFFFFF',
  onErrorContainer: '#991B1B', // Red 800

  // Neutral Colors
  surface: '#FFFFFF',
  onSurface: '#1F2937', // Gray 800
  surfaceVariant: '#F9FAFB', // Gray 50
  onSurfaceVariant: '#6B7280', // Gray 500
  background: '#FFFFFF',
  onBackground: '#1F2937', // Gray 800
  outline: '#D1D5DB', // Gray 300
  outlineVariant: '#E5E7EB', // Gray 200
  shadow: '#000000',
  
  // Card and Elevation
  elevation: {
    level0: '#FFFFFF',
    level1: '#F9FAFB',
    level2: '#F3F4F6',
    level3: '#E5E7EB',
    level4: '#D1D5DB',
    level5: '#9CA3AF',
  },

  // Text Colors
  text: {
    primary: '#1F2937', // Gray 800
    secondary: '#6B7280', // Gray 500
    disabled: '#9CA3AF', // Gray 400
    inverse: '#FFFFFF',
  },

  // Gradients
  gradients: {
    primary: ['#3B82F6', '#2563EB'] as [string, string],
    secondary: ['#10B981', '#059669'] as [string, string],
    accent: ['#8B5CF6', '#7C3AED'] as [string, string],
    success: ['#22C55E', '#16A34A'] as [string, string],
    warning: ['#F97316', '#EA580C'] as [string, string],
    error: ['#EF4444', '#DC2626'] as [string, string],
    hero: ['#667EEA', '#764BA2'] as [string, string],
    sunset: ['#FF9500', '#FF5722'] as [string, string],
    ocean: ['#00BCD4', '#2196F3'] as [string, string],
  },
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: ColorPalette.primary,
    primaryContainer: ColorPalette.primaryContainer,
    onPrimary: ColorPalette.onPrimary,
    onPrimaryContainer: ColorPalette.onPrimaryContainer,
    secondary: ColorPalette.secondary,
    secondaryContainer: ColorPalette.secondaryContainer,
    onSecondary: ColorPalette.onSecondary,
    onSecondaryContainer: ColorPalette.onSecondaryContainer,
    tertiary: ColorPalette.accent,
    tertiaryContainer: ColorPalette.accentContainer,
    onTertiary: ColorPalette.onAccent,
    onTertiaryContainer: ColorPalette.onAccentContainer,
    error: ColorPalette.error,
    errorContainer: ColorPalette.errorContainer,
    onError: ColorPalette.onError,
    onErrorContainer: ColorPalette.onErrorContainer,
    surface: ColorPalette.surface,
    onSurface: ColorPalette.onSurface,
    surfaceVariant: ColorPalette.surfaceVariant,
    onSurfaceVariant: ColorPalette.onSurfaceVariant,
    background: ColorPalette.background,
    onBackground: ColorPalette.onBackground,
    outline: ColorPalette.outline,
    outlineVariant: ColorPalette.outlineVariant,
    shadow: ColorPalette.shadow,
    // Custom colors
    success: ColorPalette.success,
    warning: ColorPalette.warning,
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: ColorPalette.primaryLight,
    primaryContainer: '#1E3A8A',
    onPrimary: '#000000',
    onPrimaryContainer: '#DBEAFE',
    secondary: ColorPalette.secondaryLight,
    secondaryContainer: '#064E3B',
    onSecondary: '#000000',
    onSecondaryContainer: '#D1FAE5',
    tertiary: ColorPalette.accentLight,
    tertiaryContainer: '#4C1D95',
    onTertiary: '#000000',
    onTertiaryContainer: '#EDE9FE',
    error: ColorPalette.errorLight,
    errorContainer: '#991B1B',
    onError: '#000000',
    onErrorContainer: '#FEE2E2',
    surface: '#1F2937',
    onSurface: '#F9FAFB',
    surfaceVariant: '#374151',
    onSurfaceVariant: '#D1D5DB',
    background: '#111827',
    onBackground: '#F9FAFB',
    outline: '#6B7280',
    outlineVariant: '#4B5563',
    shadow: '#000000',
    // Custom colors
    success: ColorPalette.successLight,
    warning: ColorPalette.warningLight,
  },
};

// Typography Scale
export const Typography = {
  // Display styles
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },

  // Headline styles
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },

  // Title styles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },

  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },

  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius Scale
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

// Elevation/Shadow Scale
export const Elevation = {
  0: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  3: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  4: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  5: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};

// Animation Duration
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Screen Breakpoints
export const Breakpoints = {
  small: 360,
  medium: 768,
  large: 1024,
  xlarge: 1440,
};

export default {
  lightTheme,
  darkTheme,
  ColorPalette,
  Typography,
  Spacing,
  BorderRadius,
  Elevation,
  AnimationDuration,
  Breakpoints,
};
