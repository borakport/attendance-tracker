import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, RadioButton, useTheme, List } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setTheme } from '@/store/slices/uiSlice';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { Layout, SpacingStyles, TypographyStyles } from '@/styles/utilities';
import { ModernCard } from '@/components/ui/ModernComponents';
import { ModernSection } from '@/components/ui/ModernLayout';

export interface ThemeSettingsProps {
  variant?: 'card' | 'list';
  showTitle?: boolean;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  variant = 'card',
  showTitle = true,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { theme: currentThemeMode } = useAppSelector((state) => state.ui);
  const { systemColorScheme, isAutoMode } = useSystemTheme();

  const themeOptions = [
    {
      value: 'auto',
      label: 'Auto',
      subtitle: `Follow system (${systemColorScheme === 'dark' ? 'Dark' : 'Light'})`,
      icon: 'brightness-auto',
    },
    {
      value: 'light',
      label: 'Light',
      subtitle: 'Always use light theme',
      icon: 'brightness-7',
    },
    {
      value: 'dark',
      label: 'Dark',
      subtitle: 'Always use dark theme',
      icon: 'brightness-3',
    },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
  };

  const renderThemeOption = (option: typeof themeOptions[0]) => {
    const isSelected = currentThemeMode === option.value;

    if (variant === 'list') {
      return (
        <List.Item
          key={option.value}
          title={option.label}
          description={option.subtitle}
          left={(props) => (
            <Icon
              {...props}
              name={option.icon as any}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          )}
          right={() => (
            <RadioButton
              value={option.value}
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => handleThemeChange(option.value as any)}
              color={theme.colors.primary}
            />
          )}
          onPress={() => handleThemeChange(option.value as any)}
        />
      );
    }

    return (
      <TouchableOpacity
        key={option.value}
        onPress={() => handleThemeChange(option.value as any)}
        style={[
          {
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
            backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
            marginBottom: 12,
          },
        ]}
      >
        <View style={[Layout.rowCenter, SpacingStyles.mbSm]}>
          <Icon
            name={option.icon as any}
            size={24}
            color={isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant}
            style={SpacingStyles.mrMd}
          />
          <View style={Layout.flex1}>
            <Text
              style={[
                TypographyStyles.titleSmall,
                {
                  color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                  fontWeight: '600',
                },
              ]}
            >
              {option.label}
            </Text>
            <Text
              style={[
                TypographyStyles.bodySmall,
                {
                  color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                  marginTop: 2,
                },
              ]}
            >
              {option.subtitle}
            </Text>
          </View>
          <RadioButton
            value={option.value}
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={() => handleThemeChange(option.value as any)}
            color={isSelected ? theme.colors.onPrimaryContainer : theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (variant === 'list') {
    return (
      <View>
        {showTitle && (
          <Text
            style={[
              TypographyStyles.titleMedium,
              { color: theme.colors.onSurface, marginBottom: 16, fontWeight: '600' },
            ]}
          >
            App Theme
          </Text>
        )}
        {themeOptions.map(renderThemeOption)}
      </View>
    );
  }

  return (
    <ModernCard variant="elevated" padding="large">
      <ModernSection
        title={showTitle ? 'App Theme' : undefined}
        subtitle="Choose how the app should look"
        spacing="medium"
      >
        <View>
          {themeOptions.map(renderThemeOption)}
          
          {isAutoMode && (
            <View
              style={[
                {
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.colors.surfaceVariant,
                  marginTop: 8,
                },
                Layout.rowCenter,
              ]}
            >
              <Icon
                name="information-outline"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={SpacingStyles.mrSm}
              />
              <Text
                style={[
                  TypographyStyles.bodySmall,
                  { color: theme.colors.onSurfaceVariant, flex: 1 },
                ]}
              >
                Auto mode automatically switches between light and dark themes based on your device's system settings.
              </Text>
            </View>
          )}
        </View>
      </ModernSection>
    </ModernCard>
  );
};

export default ThemeSettings;
