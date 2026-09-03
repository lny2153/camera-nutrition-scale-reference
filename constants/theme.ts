import { Platform } from 'react-native';

export const AppColors = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textMuted: '#A2A2A7',
  surface: '#F0F0F0',
  surfaceSoft: '#F7F7F7',
  separator: '#E5E5EA',
  orange: '#FF9F0A',
  yellow: '#FFC000',
  yellowSoft: '#FFE390',
  yellowMid: '#FFD966',
  green: '#7BF368',
  greenSoft: '#D7F8BE',
  greenChart: '#C8F2AA',
  blue: '#5C9DFF',
  blueSoft: '#DDEBFF',
  coral: '#FF7F75',
  coralSoft: '#FFE1DE',
  teal: '#52CDB5',
  tealSoft: '#D9F7F0',
  purple: '#9675F4',
  purpleSoft: '#E9E0FF',
  magenta: '#D768D8',
  magentaSoft: '#F7DDF7',
  control: '#353535',
  danger: '#FF3B30',
  white: '#FFFFFF',
} as const;

export const AppFonts = {
  regular: Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    android: 'sans-serif',
    default: 'System',
  }),
  medium: Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    android: 'sans-serif-medium',
    default: 'System',
  }),
  demiBold: Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    android: 'sans-serif-medium',
    default: 'System',
  }),
  system: Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    default: 'System',
  }),
} as const;

export const AppRadii = {
  card: 32,
  button: 999,
  small: 18,
} as const;

export const AppSpacing = {
  page: 24,
  section: 28,
  card: 18,
} as const;

// Kept for the template components that are still available in the project.
export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: AppColors.control,
    icon: AppColors.textSecondary,
    tabIconDefault: AppColors.textSecondary,
    tabIconSelected: AppColors.text,
  },
  dark: {
    text: AppColors.text,
    background: AppColors.background,
    tint: AppColors.control,
    icon: AppColors.textSecondary,
    tabIconDefault: AppColors.textSecondary,
    tabIconSelected: AppColors.text,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
