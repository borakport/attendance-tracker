import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { BorderRadius, Spacing, Elevation, Typography } from '@/constants/theme';
import { Layout, SpacingStyles } from '@/styles/utilities';

export interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  gradientColors?: [string, string];
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  color,
  gradientColors,
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      height: 36,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.sm,
    },
    medium: {
      height: 48,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
    },
    large: {
      height: 56,
      paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
  };

  const textSizes = {
    small: Typography.labelMedium,
    medium: Typography.labelLarge,
    large: Typography.titleMedium,
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...sizeStyles[size],
      ...Layout.rowCenter,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: color || theme.colors.primary,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: color || theme.colors.outline,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return baseStyle;
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'filled':
        return theme.colors.onPrimary;
      case 'outlined':
      case 'text':
        return color || theme.colors.primary;
      case 'gradient':
        return '#FFFFFF';
      default:
        return theme.colors.onPrimary;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size={iconSizes[size]} color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon as any}
              size={iconSizes[size]}
              color={getTextColor()}
              style={SpacingStyles.mrSm}
            />
          )}
          <Text
            style={[
              textSizes[size],
              { color: getTextColor(), fontWeight: '600' },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon as any}
              size={iconSizes[size]}
              color={getTextColor()}
              style={SpacingStyles.mlSm}
            />
          )}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors || ['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: sizeStyles[size].borderRadius },
          ]}
        />
        <View style={Layout.rowCenter}>{renderContent()}</View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  style,
  onPress,
}) => {
  const theme = useTheme();

  const paddingStyles = {
    none: {},
    small: SpacingStyles.pSm,
    medium: SpacingStyles.pMd,
    large: SpacingStyles.pLg,
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius.md,
      backgroundColor: theme.colors.surface,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...Elevation[2],
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      default:
        return baseStyle;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[getCardStyle(), paddingStyles[padding], style]}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Component>
  );
};

export interface ModernChipProps {
  label: string;
  variant?: 'filled' | 'outlined' | 'elevated';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const ModernChip: React.FC<ModernChipProps> = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  icon,
  selected = false,
  onPress,
  onDelete,
  style,
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      height: 28,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.sm,
    },
    medium: {
      height: 32,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
    },
  };

  const textSizes = {
    small: Typography.labelSmall,
    medium: Typography.labelMedium,
  };

  const getChipColors = () => {
    const colors = {
      primary: {
        background: theme.colors.primaryContainer,
        text: theme.colors.onPrimaryContainer,
        border: theme.colors.primary,
      },
      secondary: {
        background: theme.colors.secondaryContainer,
        text: theme.colors.onSecondaryContainer,
        border: theme.colors.secondary,
      },
      success: {
        background: '#DCFCE7',
        text: '#14532D',
        border: '#16A34A',
      },
      warning: {
        background: '#FED7AA',
        text: '#9A3412',
        border: '#EA580C',
      },
      error: {
        background: theme.colors.errorContainer,
        text: theme.colors.onErrorContainer,
        border: theme.colors.error,
      },
    };
    return colors[color];
  };

  const chipColors = getChipColors();

  const getChipStyle = () => {
    const baseStyle = {
      ...sizeStyles[size],
      ...Layout.rowCenter,
      opacity: selected ? 1 : 0.8,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: selected ? chipColors.border : chipColors.background,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: chipColors.border,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: chipColors.background,
          ...Elevation[1],
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (variant === 'filled' && selected) {
      return '#FFFFFF';
    }
    return chipColors.text;
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      style={[getChipStyle(), style]}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {icon && (
        <Icon
          name={icon as any}
          size={16}
          color={getTextColor()}
          style={SpacingStyles.mrXs}
        />
      )}
      <Text style={[textSizes[size], { color: getTextColor() }]}>{label}</Text>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={SpacingStyles.mlXs}>
          <Icon name="close" size={16} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </Component>
  );
};

export interface ModernBadgeProps {
  count?: number;
  variant?: 'dot' | 'count';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  count = 0,
  variant = 'count',
  color = 'error',
  size = 'medium',
  style,
  children,
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      fontSize: 10,
    },
    medium: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      fontSize: 12,
    },
    large: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      fontSize: 14,
    },
  };

  const getColors = () => {
    const colors = {
      primary: { background: theme.colors.primary, text: theme.colors.onPrimary },
      secondary: { background: theme.colors.secondary, text: theme.colors.onSecondary },
      success: { background: '#16A34A', text: '#FFFFFF' },
      warning: { background: '#EA580C', text: '#FFFFFF' },
      error: { background: theme.colors.error, text: theme.colors.onError },
    };
    return colors[color];
  };

  const badgeColors = getColors();
  const sizeStyle = sizeStyles[size];

  if (variant === 'dot') {
    return (
      <View
        style={[
          {
            width: sizeStyle.height / 2,
            height: sizeStyle.height / 2,
            borderRadius: sizeStyle.height / 4,
            backgroundColor: badgeColors.background,
          },
          style,
        ]}
      />
    );
  }

  if (count === 0 && !children) return null;

  return (
    <View
      style={[
        {
          ...sizeStyle,
          backgroundColor: badgeColors.background,
          ...Layout.centerAll,
          paddingHorizontal: variant === 'count' ? 4 : 0,
        },
        style,
      ]}
    >
      {children || (
        <Text
          style={[
            {
              fontSize: sizeStyle.fontSize,
              color: badgeColors.text,
              fontWeight: '600',
            },
          ]}
        >
          {count > 99 ? '99+' : count}
        </Text>
      )}
    </View>
  );
};
