import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ColorPalette, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Layout, SpacingStyles, ContainerStyles } from '@/styles/utilities';

export interface ModernScreenProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'surface';
  gradientColors?: [string, string];
  padding?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ModernScreen: React.FC<ModernScreenProps> = ({
  children,
  variant = 'default',
  gradientColors = ['#667EEA', '#764BA2'],
  padding = true,
  safeArea = true,
  keyboardAvoiding = true,
  style,
  contentContainerStyle,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const getBackgroundStyle = (): ViewStyle => {
    switch (variant) {
      case 'gradient':
        return {};
      case 'surface':
        return { backgroundColor: theme.colors.surfaceVariant };
      default:
        return { backgroundColor: theme.colors.background };
    }
  };

  const Container = safeArea ? SafeAreaView : View;
  const KeyboardContainer = keyboardAvoiding ? KeyboardAvoidingView : View;

  const content = (
    <Container style={[ContainerStyles.screen, getBackgroundStyle(), style]}>
      <KeyboardContainer
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Layout.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View
          style={[
            Layout.flex1,
            padding && SpacingStyles.pMd,
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      </KeyboardContainer>
    </Container>
  );

  if (variant === 'gradient') {
    return (
      <View style={Layout.flex1}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {content}
      </View>
    );
  }

  return content;
};

export interface ModernScrollViewProps extends ScrollViewProps {
  variant?: 'default' | 'gradient' | 'surface';
  gradientColors?: [string, string];
  padding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ModernScrollView: React.FC<ModernScrollViewProps> = ({
  children,
  variant = 'default',
  gradientColors = ['#667EEA', '#764BA2'],
  padding = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  ...props
}) => {
  const theme = useTheme();

  const getBackgroundStyle = (): ViewStyle => {
    switch (variant) {
      case 'gradient':
        return {};
      case 'surface':
        return { backgroundColor: theme.colors.surfaceVariant };
      default:
        return { backgroundColor: theme.colors.background };
    }
  };

  const scrollContent = (
    <ScrollView
      style={[ContainerStyles.screen, getBackgroundStyle(), style]}
      contentContainerStyle={[
        ContainerStyles.scrollContainer,
        padding && SpacingStyles.pMd,
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh
          ? {
              refreshing,
              onRefresh,
              tintColor: theme.colors.primary,
              colors: [theme.colors.primary],
            } as any
          : undefined
      }
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );

  if (variant === 'gradient') {
    return (
      <View style={Layout.flex1}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {scrollContent}
      </View>
    );
  }

  return scrollContent;
};

export interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  variant?: 'default' | 'large' | 'centered';
  style?: ViewStyle;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const headerStyles = {
    default: {
      paddingTop: insets.top + Spacing.sm,
      paddingBottom: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    large: {
      paddingTop: insets.top + Spacing.md,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.md,
    },
    centered: {
      paddingTop: insets.top + Spacing.sm,
      paddingBottom: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
  };

  const titleStyles = {
    default: Typography.titleLarge,
    large: Typography.headlineMedium,
    centered: Typography.titleLarge,
  };

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        },
        headerStyles[variant],
        style,
      ]}
    >
      <View style={Layout.rowBetween}>
        <View style={Layout.rowCenter}>
          {leftAction && (
            <View style={SpacingStyles.mrMd}>
              <Icon
                name={leftAction.icon as any}
                size={24}
                color={theme.colors.onSurface}
                onPress={leftAction.onPress}
              />
            </View>
          )}
          <View style={variant === 'centered' ? Layout.flex1 : undefined}>
            <Text
              style={[
                titleStyles[variant],
                {
                  color: theme.colors.onSurface,
                  textAlign: variant === 'centered' ? 'center' : 'left',
                },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  Typography.bodyMedium,
                  {
                    color: theme.colors.onSurfaceVariant,
                    textAlign: variant === 'centered' ? 'center' : 'left',
                    marginTop: 2,
                  },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction && (
          <Icon
            name={rightAction.icon as any}
            size={24}
            color={theme.colors.onSurface}
            onPress={rightAction.onPress}
          />
        )}
      </View>
    </View>
  );
};

export interface ModernSectionProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  children: React.ReactNode;
  spacing?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  subtitle,
  action,
  children,
  spacing = 'medium',
  style,
}) => {
  const theme = useTheme();

  const spacingStyles = {
    small: SpacingStyles.mvSm,
    medium: SpacingStyles.mvMd,
    large: SpacingStyles.mvLg,
  };

  return (
    <View style={[spacingStyles[spacing], style]}>
      {(title || subtitle || action) && (
        <View style={[Layout.rowBetween, SpacingStyles.mbMd]}>
          <View style={Layout.flex1}>
            {title && (
              <Text
                style={[
                  Typography.titleMedium,
                  { color: theme.colors.onSurface, fontWeight: '600' },
                ]}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: theme.colors.onSurfaceVariant, marginTop: 2 },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {action && (
            <Text
              style={[
                Typography.labelLarge,
                { color: theme.colors.primary, fontWeight: '600' },
              ]}
              onPress={action.onPress}
            >
              {action.label}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

export interface ModernEmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const ModernEmptyState: React.FC<ModernEmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  subtitle,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[ContainerStyles.centeredContainer, SpacingStyles.pXl, style]}>
      <Icon
        name={icon as any}
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={SpacingStyles.mbMd}
      />
      <Text
        style={[
          Typography.titleMedium,
          {
            color: theme.colors.onSurface,
            textAlign: 'center',
            fontWeight: '600',
          },
          SpacingStyles.mbSm,
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            Typography.bodyMedium,
            {
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              lineHeight: 20,
            },
            SpacingStyles.mbLg,
          ]}
        >
          {subtitle}
        </Text>
      )}
      {action && (
        <Text
          style={[
            Typography.labelLarge,
            {
              color: theme.colors.primary,
              fontWeight: '600',
              textAlign: 'center',
            },
          ]}
          onPress={action.onPress}
        >
          {action.label}
        </Text>
      )}
    </View>
  );
};

export interface ModernLoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const ModernLoadingState: React.FC<ModernLoadingStateProps> = ({
  message = 'Loading...',
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[ContainerStyles.centeredContainer, style]}>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={SpacingStyles.mbMd}
      />
      <Text
        style={[
          Typography.bodyMedium,
          {
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

export interface ModernDividerProps {
  variant?: 'full' | 'middle' | 'inset';
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
}

export const ModernDivider: React.FC<ModernDividerProps> = ({
  variant = 'full',
  orientation = 'horizontal',
  thickness = 1,
  color,
  style,
}) => {
  const theme = useTheme();

  const getMarginStyle = (): ViewStyle => {
    if (orientation === 'vertical') return {};
    
    switch (variant) {
      case 'middle':
        return { marginHorizontal: Spacing.lg };
      case 'inset':
        return { marginLeft: Spacing.lg };
      default:
        return {};
    }
  };

  const dividerStyle: ViewStyle = {
    backgroundColor: color || theme.colors.outlineVariant,
    ...(orientation === 'horizontal'
      ? { height: thickness }
      : { width: thickness, flex: 1 }),
    ...getMarginStyle(),
  };

  return <View style={[dividerStyle, style]} />;
};
