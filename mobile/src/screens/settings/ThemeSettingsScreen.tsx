import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ModernScreen, ModernHeader } from '@/components/ui/ModernLayout';
import { SpacingStyles, TypographyStyles } from '@/styles/utilities';
import ThemeSettings from '@/components/settings/ThemeSettings';

export default function ThemeSettingsScreen({ navigation }: any) {
  const theme = useTheme();

  return (
    <ModernScreen padding={false}>
      <ModernHeader
        title="Theme Settings"
        subtitle="Customize app appearance"
        leftAction={{
          icon: 'arrow-left',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={SpacingStyles.pMd}>
        <Text
          style={[
            TypographyStyles.bodyLarge,
            { 
              color: theme.colors.onSurfaceVariant, 
              marginBottom: 24,
              lineHeight: 24,
            },
          ]}
        >
          Choose how Smart Attendance should look. Auto mode will automatically switch between light and dark themes based on your device's system settings.
        </Text>

        <ThemeSettings variant="card" showTitle={false} />

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ModernScreen>
  );
}
