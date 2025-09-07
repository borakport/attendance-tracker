import { StyleSheet, Dimensions as RNDimensions } from 'react-native';
import { Spacing, BorderRadius, Elevation, Typography, ColorPalette } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = RNDimensions.get('window');

// Layout Utilities
export const Layout = StyleSheet.create({
  // Flex utilities
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexWrap: { flexWrap: 'wrap' },
  flexNoWrap: { flexWrap: 'nowrap' },

  // Justify content
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },

  // Align items
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  alignStretch: { alignItems: 'stretch' },
  alignBaseline: { alignItems: 'baseline' },

  // Align self
  selfStart: { alignSelf: 'flex-start' },
  selfEnd: { alignSelf: 'flex-end' },
  selfCenter: { alignSelf: 'center' },
  selfStretch: { alignSelf: 'stretch' },

  // Position
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },

  // Common flex combinations
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

// Spacing Utilities
export const SpacingStyles = StyleSheet.create({
  // Margin
  mXs: { margin: Spacing.xs },
  mSm: { margin: Spacing.sm },
  mMd: { margin: Spacing.md },
  mLg: { margin: Spacing.lg },
  mXl: { margin: Spacing.xl },
  mXxl: { margin: Spacing.xxl },

  // Margin horizontal
  mhXs: { marginHorizontal: Spacing.xs },
  mhSm: { marginHorizontal: Spacing.sm },
  mhMd: { marginHorizontal: Spacing.md },
  mhLg: { marginHorizontal: Spacing.lg },
  mhXl: { marginHorizontal: Spacing.xl },

  // Margin vertical
  mvXs: { marginVertical: Spacing.xs },
  mvSm: { marginVertical: Spacing.sm },
  mvMd: { marginVertical: Spacing.md },
  mvLg: { marginVertical: Spacing.lg },
  mvXl: { marginVertical: Spacing.xl },

  // Margin top
  mtXs: { marginTop: Spacing.xs },
  mtSm: { marginTop: Spacing.sm },
  mtMd: { marginTop: Spacing.md },
  mtLg: { marginTop: Spacing.lg },
  mtXl: { marginTop: Spacing.xl },

  // Margin bottom
  mbXs: { marginBottom: Spacing.xs },
  mbSm: { marginBottom: Spacing.sm },
  mbMd: { marginBottom: Spacing.md },
  mbLg: { marginBottom: Spacing.lg },
  mbXl: { marginBottom: Spacing.xl },

  // Margin left
  mlXs: { marginLeft: Spacing.xs },
  mlSm: { marginLeft: Spacing.sm },
  mlMd: { marginLeft: Spacing.md },
  mlLg: { marginLeft: Spacing.lg },
  mlXl: { marginLeft: Spacing.xl },

  // Margin right
  mrXs: { marginRight: Spacing.xs },
  mrSm: { marginRight: Spacing.sm },
  mrMd: { marginRight: Spacing.md },
  mrLg: { marginRight: Spacing.lg },
  mrXl: { marginRight: Spacing.xl },

  // Padding
  pXs: { padding: Spacing.xs },
  pSm: { padding: Spacing.sm },
  pMd: { padding: Spacing.md },
  pLg: { padding: Spacing.lg },
  pXl: { padding: Spacing.xl },
  pXxl: { padding: Spacing.xxl },

  // Padding horizontal
  phXs: { paddingHorizontal: Spacing.xs },
  phSm: { paddingHorizontal: Spacing.sm },
  phMd: { paddingHorizontal: Spacing.md },
  phLg: { paddingHorizontal: Spacing.lg },
  phXl: { paddingHorizontal: Spacing.xl },

  // Padding vertical
  pvXs: { paddingVertical: Spacing.xs },
  pvSm: { paddingVertical: Spacing.sm },
  pvMd: { paddingVertical: Spacing.md },
  pvLg: { paddingVertical: Spacing.lg },
  pvXl: { paddingVertical: Spacing.xl },

  // Padding top
  ptXs: { paddingTop: Spacing.xs },
  ptSm: { paddingTop: Spacing.sm },
  ptMd: { paddingTop: Spacing.md },
  ptLg: { paddingTop: Spacing.lg },
  ptXl: { paddingTop: Spacing.xl },

  // Padding bottom
  pbXs: { paddingBottom: Spacing.xs },
  pbSm: { paddingBottom: Spacing.sm },
  pbMd: { paddingBottom: Spacing.md },
  pbLg: { paddingBottom: Spacing.lg },
  pbXl: { paddingBottom: Spacing.xl },

  // Padding left
  plXs: { paddingLeft: Spacing.xs },
  plSm: { paddingLeft: Spacing.sm },
  plMd: { paddingLeft: Spacing.md },
  plLg: { paddingLeft: Spacing.lg },
  plXl: { paddingLeft: Spacing.xl },

  // Padding right
  prXs: { paddingRight: Spacing.xs },
  prSm: { paddingRight: Spacing.sm },
  prMd: { paddingRight: Spacing.md },
  prLg: { paddingRight: Spacing.lg },
  prXl: { paddingRight: Spacing.xl },
});

// Typography Utilities
export const TypographyStyles = StyleSheet.create({
  displayLarge: Typography.displayLarge,
  displayMedium: Typography.displayMedium,
  displaySmall: Typography.displaySmall,
  headlineLarge: Typography.headlineLarge,
  headlineMedium: Typography.headlineMedium,
  headlineSmall: Typography.headlineSmall,
  titleLarge: Typography.titleLarge,
  titleMedium: Typography.titleMedium,
  titleSmall: Typography.titleSmall,
  labelLarge: Typography.labelLarge,
  labelMedium: Typography.labelMedium,
  labelSmall: Typography.labelSmall,
  bodyLarge: Typography.bodyLarge,
  bodyMedium: Typography.bodyMedium,
  bodySmall: Typography.bodySmall,

  // Text alignment
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textJustify: { textAlign: 'justify' },

  // Font weights
  fontThin: { fontWeight: '100' },
  fontLight: { fontWeight: '300' },
  fontNormal: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemiBold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
  fontExtraBold: { fontWeight: '800' },
  fontBlack: { fontWeight: '900' },

  // Text transforms
  uppercase: { textTransform: 'uppercase' },
  lowercase: { textTransform: 'lowercase' },
  capitalize: { textTransform: 'capitalize' },
});

// Border Utilities
export const BorderStyles = StyleSheet.create({
  // Border radius
  roundedXs: { borderRadius: BorderRadius.xs },
  roundedSm: { borderRadius: BorderRadius.sm },
  roundedMd: { borderRadius: BorderRadius.md },
  roundedLg: { borderRadius: BorderRadius.lg },
  roundedXl: { borderRadius: BorderRadius.xl },
  roundedXxl: { borderRadius: BorderRadius.xxl },
  roundedFull: { borderRadius: BorderRadius.round },

  // Border width
  border: { borderWidth: 1 },
  borderTop: { borderTopWidth: 1 },
  borderBottom: { borderBottomWidth: 1 },
  borderLeft: { borderLeftWidth: 1 },
  borderRight: { borderRightWidth: 1 },

  // Border colors (light theme)
  borderPrimary: { borderColor: ColorPalette.primary },
  borderSecondary: { borderColor: ColorPalette.secondary },
  borderSuccess: { borderColor: ColorPalette.success },
  borderWarning: { borderColor: ColorPalette.warning },
  borderError: { borderColor: ColorPalette.error },
  borderOutline: { borderColor: ColorPalette.outline },
  borderOutlineVariant: { borderColor: ColorPalette.outlineVariant },
});

// Background Utilities
export const BackgroundStyles = StyleSheet.create({
  bgPrimary: { backgroundColor: ColorPalette.primary },
  bgPrimaryLight: { backgroundColor: ColorPalette.primaryLight },
  bgPrimaryContainer: { backgroundColor: ColorPalette.primaryContainer },
  bgSecondary: { backgroundColor: ColorPalette.secondary },
  bgSecondaryLight: { backgroundColor: ColorPalette.secondaryLight },
  bgSecondaryContainer: { backgroundColor: ColorPalette.secondaryContainer },
  bgAccent: { backgroundColor: ColorPalette.accent },
  bgAccentContainer: { backgroundColor: ColorPalette.accentContainer },
  bgSuccess: { backgroundColor: ColorPalette.success },
  bgSuccessContainer: { backgroundColor: ColorPalette.successContainer },
  bgWarning: { backgroundColor: ColorPalette.warning },
  bgWarningContainer: { backgroundColor: ColorPalette.warningContainer },
  bgError: { backgroundColor: ColorPalette.error },
  bgErrorContainer: { backgroundColor: ColorPalette.errorContainer },
  bgSurface: { backgroundColor: ColorPalette.surface },
  bgSurfaceVariant: { backgroundColor: ColorPalette.surfaceVariant },
  bgBackground: { backgroundColor: ColorPalette.background },
  bgTransparent: { backgroundColor: 'transparent' },
});

// Shadow/Elevation Utilities
export const ShadowStyles = StyleSheet.create({
  elevation0: Elevation[0],
  elevation1: Elevation[1],
  elevation2: Elevation[2],
  elevation3: Elevation[3],
  elevation4: Elevation[4],
  elevation5: Elevation[5],
});

// Dimension Utilities
export const ScreenDimensions = {
  screenWidth,
  screenHeight,
  windowWidth: screenWidth,
  windowHeight: screenHeight,
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 768,
  isLargeScreen: screenWidth >= 768,
};

// Common Card Styles
export const CardStyles = StyleSheet.create({
  card: {
    backgroundColor: ColorPalette.surface,
    borderRadius: BorderRadius.md,
    ...Elevation[1],
    padding: Spacing.md,
  },
  cardElevated: {
    backgroundColor: ColorPalette.surface,
    borderRadius: BorderRadius.md,
    ...Elevation[3],
    padding: Spacing.md,
  },
  cardOutlined: {
    backgroundColor: ColorPalette.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: ColorPalette.outline,
    padding: Spacing.md,
  },
  cardFilled: {
    backgroundColor: ColorPalette.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
});

// Button Styles
export const ButtonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: ColorPalette.primary,
    borderRadius: BorderRadius.lg,
  },
  secondaryButton: {
    backgroundColor: ColorPalette.secondary,
    borderRadius: BorderRadius.lg,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ColorPalette.outline,
    borderRadius: BorderRadius.lg,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
  },
  floatingActionButton: {
    backgroundColor: ColorPalette.primary,
    borderRadius: BorderRadius.round,
    ...Elevation[3],
  },
});

// Input Styles
export const InputStyles = StyleSheet.create({
  textInput: {
    backgroundColor: ColorPalette.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: ColorPalette.outline,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: ColorPalette.text.primary,
  },
  textInputFocused: {
    borderColor: ColorPalette.primary,
    borderWidth: 2,
  },
  textInputError: {
    borderColor: ColorPalette.error,
  },
});

// Container Styles
export const ContainerStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ColorPalette.background,
  },
  screenWithPadding: {
    flex: 1,
    backgroundColor: ColorPalette.background,
    padding: Spacing.md,
  },
  safeArea: {
    flex: 1,
    backgroundColor: ColorPalette.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: ColorPalette.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPalette.background,
  },
});

// Helper functions
export const createSpacing = (multiplier: number) => Spacing.md * multiplier;
export const createBorderRadius = (size: keyof typeof BorderRadius) => BorderRadius[size];
export const createElevation = (level: keyof typeof Elevation) => Elevation[level];

// Responsive helpers
export const responsive = {
  width: (percentage: number) => (screenWidth * percentage) / 100,
  height: (percentage: number) => (screenHeight * percentage) / 100,
  fontSize: (size: number) => {
    if (ScreenDimensions.isSmallScreen) return size * 0.9;
    if (ScreenDimensions.isLargeScreen) return size * 1.1;
    return size;
  },
  spacing: (size: number) => {
    if (ScreenDimensions.isSmallScreen) return size * 0.8;
    if (ScreenDimensions.isLargeScreen) return size * 1.2;
    return size;
  },
};

export default {
  Layout,
  SpacingStyles,
  TypographyStyles,
  BorderStyles,
  BackgroundStyles,
  ShadowStyles,
  CardStyles,
  ButtonStyles,
  InputStyles,
  ContainerStyles,
  ScreenDimensions,
  responsive,
  createSpacing,
  createBorderRadius,
  createElevation,
};
