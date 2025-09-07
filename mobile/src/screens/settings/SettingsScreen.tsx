import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, List, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppSelector } from '@/hooks/redux';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { Layout, SpacingStyles, TypographyStyles } from '@/styles/utilities';
import { ModernScreen, ModernHeader, ModernSection } from '@/components/ui/ModernLayout';
import { ModernCard } from '@/components/ui/ModernComponents';
import ThemeSettings from '@/components/settings/ThemeSettings';

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { systemColorScheme, isAutoMode } = useSystemTheme();

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Theme',
          subtitle: isAutoMode 
            ? `Auto (${systemColorScheme === 'dark' ? 'Dark' : 'Light'})`
            : theme.dark 
            ? 'Dark' 
            : 'Light',
          icon: 'palette',
          onPress: () => navigation.navigate('ThemeSettings'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          subtitle: 'Manage your account information',
          icon: 'account',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          title: 'Privacy & Security',
          subtitle: 'Control your privacy settings',
          icon: 'shield-account',
          onPress: () => navigation.navigate('Privacy'),
        },
      ],
    },
    {
      title: 'Attendance',
      items: [
        {
          title: 'Location Settings',
          subtitle: 'Manage GPS and location preferences',
          icon: 'map-marker',
          onPress: () => navigation.navigate('LocationSettings'),
        },
        {
          title: 'Notifications',
          subtitle: 'Configure attendance alerts',
          icon: 'bell',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & FAQ',
          subtitle: 'Get help and find answers',
          icon: 'help-circle',
          onPress: () => navigation.navigate('Help'),
        },
        {
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'email',
          onPress: () => navigation.navigate('Contact'),
        },
        {
          title: 'About',
          subtitle: 'App version and information',
          icon: 'information',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <ModernScreen padding={false}>
      <ModernHeader
        title="Settings"
        subtitle="Customize your experience"
        leftAction={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView style={Layout.flex1} contentContainerStyle={SpacingStyles.pMd}>
        {/* User Profile Section */}
        <ModernCard variant="elevated" padding="large" style={SpacingStyles.mbLg}>
          <View style={[Layout.rowCenter, SpacingStyles.mbMd]}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.colors.primaryContainer,
                ...Layout.centerAll,
                marginRight: 16,
              }}
            >
              <Icon
                name="account"
                size={32}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
            <View style={Layout.flex1}>
              <Text
                style={[
                  TypographyStyles.titleLarge,
                  { color: theme.colors.onSurface, fontWeight: '600' },
                ]}
              >
                {user?.firstName} {user?.lastName}
              </Text>
              <Text
                style={[
                  TypographyStyles.bodyMedium,
                  { color: theme.colors.onSurfaceVariant, marginTop: 2 },
                ]}
              >
                {user?.email}
              </Text>
              <Text
                style={[
                  TypographyStyles.labelMedium,
                  { 
                    color: theme.colors.primary, 
                    marginTop: 4,
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {user?.role}
              </Text>
            </View>
          </View>
        </ModernCard>

        {/* Theme Settings - Embedded */}
        <View style={SpacingStyles.mbLg}>
          <ThemeSettings variant="card" />
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <ModernSection
            key={section.title}
            title={section.title}
            spacing="medium"
          >
            <ModernCard variant="outlined" padding="none">
              {section.items.map((item, itemIndex) => (
                <View key={item.title}>
                  <List.Item
                    title={item.title}
                    description={item.subtitle}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={item.icon}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                    right={(props) => (
                      <List.Icon
                        {...props}
                        icon="chevron-right"
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                    onPress={item.onPress}
                    style={{
                      paddingVertical: 8,
                    }}
                  />
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={{ marginLeft: 56 }} />
                  )}
                </View>
              ))}
            </ModernCard>
          </ModernSection>
        ))}

        {/* Version Info */}
        <View style={[Layout.centerAll, SpacingStyles.mvXl]}>
          <Text
            style={[
              TypographyStyles.bodySmall,
              { color: theme.colors.onSurfaceVariant, textAlign: 'center' },
            ]}
          >
            Smart Attendance v1.0.0
          </Text>
          <Text
            style={[
              TypographyStyles.bodySmall,
              { 
                color: theme.colors.onSurfaceVariant, 
                textAlign: 'center',
                marginTop: 4,
              },
            ]}
          >
            Made with ❤️ for education
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ModernScreen>
  );
}
