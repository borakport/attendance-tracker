import React, { useState, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Text, useTheme, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { Layout, SpacingStyles } from '@/styles/utilities';

export interface ModernTextInputProps extends RNTextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
}

export const ModernTextInput = forwardRef<RNTextInput, ModernTextInputProps>(
  (
    {
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'medium',
      style,
      inputStyle,
      containerStyle,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const sizeStyles = {
      small: {
        height: 40,
        fontSize: 14,
        paddingHorizontal: Spacing.sm,
      },
      medium: {
        height: 48,
        fontSize: 16,
        paddingHorizontal: Spacing.md,
      },
      large: {
        height: 56,
        fontSize: 18,
        paddingHorizontal: Spacing.lg,
      },
    };

    const getContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: BorderRadius.md,
        ...Layout.rowCenter,
        backgroundColor: variant === 'filled' ? theme.colors.surfaceVariant : theme.colors.surface,
        borderWidth: variant === 'outlined' ? 1 : 0,
        opacity: disabled ? 0.6 : 1,
      };

      let borderColor = theme.colors.outline;
      if (errorText) {
        borderColor = theme.colors.error;
      } else if (isFocused) {
        borderColor = theme.colors.primary;
      }

      return {
        ...baseStyle,
        borderColor,
        borderWidth: variant === 'outlined' ? (isFocused ? 2 : 1) : 0,
      };
    };

    const getInputStyle = (): TextStyle => ({
      flex: 1,
      height: sizeStyles[size].height,
      fontSize: sizeStyles[size].fontSize,
      color: theme.colors.onSurface,
      paddingLeft: leftIcon ? Spacing.xs : sizeStyles[size].paddingHorizontal,
      paddingRight: rightIcon ? Spacing.xs : sizeStyles[size].paddingHorizontal,
      paddingVertical: 0,
    });

    const iconSize = {
      small: 20,
      medium: 24,
      large: 28,
    }[size];

    return (
      <View style={[containerStyle]}>
        {label && (
          <View style={[Layout.rowCenter, SpacingStyles.mbXs]}>
            <Text
              style={[
                Typography.labelMedium,
                {
                  color: errorText ? theme.colors.error : theme.colors.onSurfaceVariant,
                  fontWeight: '500',
                },
              ]}
            >
              {label}
            </Text>
            {required && (
              <Text
                style={[
                  Typography.labelMedium,
                  { color: theme.colors.error, marginLeft: 4 },
                ]}
              >
                *
              </Text>
            )}
          </View>
        )}

        <View style={[getContainerStyle(), style]}>
          {leftIcon && (
            <View style={SpacingStyles.plMd}>
              <Icon
                name={leftIcon as any}
                size={iconSize}
                color={
                  errorText
                    ? theme.colors.error
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
            </View>
          )}

          <RNTextInput
            ref={ref}
            style={[getInputStyle(), inputStyle]}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            editable={!disabled}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={SpacingStyles.prMd}
              disabled={!onRightIconPress}
            >
              <Icon
                name={rightIcon as any}
                size={iconSize}
                color={
                  errorText
                    ? theme.colors.error
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {(helperText || errorText) && (
          <HelperText
            type={errorText ? 'error' : 'info'}
            visible={!!(helperText || errorText)}
            style={SpacingStyles.mtXs}
          >
            {errorText || helperText}
          </HelperText>
        )}
      </View>
    );
  }
);

ModernTextInput.displayName = 'ModernTextInput';

export interface ModernSelectProps {
  label?: string;
  value?: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  helperText?: string;
  errorText?: string;
  icon?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
  helperText,
  errorText,
  icon,
  variant = 'outlined',
  size = 'medium',
  style,
  containerStyle,
  required = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeStyles = {
    small: {
      height: 40,
      fontSize: 14,
      paddingHorizontal: Spacing.sm,
    },
    medium: {
      height: 48,
      fontSize: 16,
      paddingHorizontal: Spacing.md,
    },
    large: {
      height: 56,
      fontSize: 18,
      paddingHorizontal: Spacing.lg,
    },
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      backgroundColor: variant === 'filled' ? theme.colors.surfaceVariant : theme.colors.surface,
      borderWidth: variant === 'outlined' ? 1 : 0,
      opacity: disabled ? 0.6 : 1,
    };

    let borderColor = theme.colors.outline;
    if (errorText) {
      borderColor = theme.colors.error;
    } else if (isOpen) {
      borderColor = theme.colors.primary;
    }

    return {
      ...baseStyle,
      borderColor,
      borderWidth: variant === 'outlined' ? (isOpen ? 2 : 1) : 0,
    };
  };

  const selectedOption = options.find(option => option.value === value);
  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  }[size];

  return (
    <View style={containerStyle}>
      {label && (
        <View style={[Layout.rowCenter, SpacingStyles.mbXs]}>
          <Text
            style={[
              Typography.labelMedium,
              {
                color: errorText ? theme.colors.error : theme.colors.onSurfaceVariant,
                fontWeight: '500',
              },
            ]}
          >
            {label}
          </Text>
          {required && (
            <Text
              style={[
                Typography.labelMedium,
                { color: theme.colors.error, marginLeft: 4 },
              ]}
            >
              *
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(!isOpen)}
        style={[getContainerStyle(), style]}
        activeOpacity={0.8}
      >
        <View style={[Layout.rowBetween, { height: sizeStyles[size].height }]}>
          <View style={[Layout.rowCenter, { flex: 1 }]}>
            {icon && (
              <View style={SpacingStyles.plMd}>
                <Icon
                  name={icon as any}
                  size={iconSize}
                  color={
                    errorText
                      ? theme.colors.error
                      : isOpen
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
              </View>
            )}
            <Text
              style={[
                {
                  fontSize: sizeStyles[size].fontSize,
                  paddingLeft: icon ? Spacing.xs : sizeStyles[size].paddingHorizontal,
                  color: selectedOption
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {selectedOption?.label || placeholder || 'Select an option'}
            </Text>
          </View>
          <View style={SpacingStyles.prMd}>
            <Icon
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={iconSize}
              color={
                errorText
                  ? theme.colors.error
                  : isOpen
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            {
              position: 'absolute',
              top: (label ? 24 : 0) + sizeStyles[size].height + 4,
              left: 0,
              right: 0,
              backgroundColor: theme.colors.surface,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              maxHeight: 200,
              zIndex: 1000,
            },
            // Add shadow/elevation here
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              style={[
                {
                  paddingHorizontal: sizeStyles[size].paddingHorizontal,
                  paddingVertical: Spacing.sm,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: sizeStyles[size].fontSize,
                    color: option.value === value ? theme.colors.primary : theme.colors.onSurface,
                    fontWeight: option.value === value ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(helperText || errorText) && (
        <HelperText
          type={errorText ? 'error' : 'info'}
          visible={!!(helperText || errorText)}
          style={SpacingStyles.mtXs}
        >
          {errorText || helperText}
        </HelperText>
      )}
    </View>
  );
};
