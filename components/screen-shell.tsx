import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export function ScreenShell({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? '#F4F4F5' : AppColors.background,
        alignItems: 'center',
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: 520,
          flex: 1,
          backgroundColor: AppColors.background,
          overflow: 'hidden',
        }}>
        {children}
      </View>
    </View>
  );
}
