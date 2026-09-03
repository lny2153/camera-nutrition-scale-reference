import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { useAppState } from '@/components/app-state';
import { AppColors, AppFonts } from '@/constants/theme';

function CircleButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}>
      <Ionicons name={icon} size={25} color={AppColors.text} />
    </Pressable>
  );
}

function BatteryButton({ battery, onPress }: { battery: number; onPress: () => void }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, battery));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`卡路里秤已连接，当前电量 ${clamped}%`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 58,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        opacity: pressed ? 0.58 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}>
      <Svg width={58} height={58} style={{ position: 'absolute' }}>
        <Circle cx={29} cy={29} r={radius} fill="none" stroke="#D6D6D8" strokeWidth={5} />
        <Circle
          cx={29}
          cy={29}
          r={radius}
          fill="none"
          stroke={AppColors.green}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          transform="rotate(-90 29 29)"
        />
      </Svg>
      <Ionicons name="scale-outline" size={25} color={AppColors.text} />
    </Pressable>
  );
}

function DeviceStatusCard({
  visible,
  onClose,
  battery,
  version,
}: {
  visible: boolean;
  onClose: () => void;
  battery: number;
  version: string;
}) {
  const rows = [
    { label: '连接状态', value: '已连接', color: AppColors.green },
    { label: '当前电量', value: `${battery}%`, color: AppColors.green },
    { label: '当前版本号', value: `v${version}`, color: AppColors.textSecondary },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' }}>
        <Pressable accessibilityLabel="关闭设备状态" onPress={onClose} style={{ flex: 1 }} />
        <View
          accessibilityRole="summary"
          style={{
            position: 'absolute',
            top: 104,
            right: 24,
            width: 250,
            borderRadius: 28,
            backgroundColor: AppColors.white,
            padding: 20,
            gap: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: AppColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="scale-outline" size={24} />
            </View>
            <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 20 }}>卡路里秤</Text>
          </View>
          {rows.map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: AppFonts.regular, fontSize: 15, color: AppColors.textSecondary }}>
                {row.label}
              </Text>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: row.color,
                  marginRight: 7,
                }}
              />
              <Text selectable style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function WhiteFadeMask() {
  return (
    <View style={{ height: 42, width: '100%', pointerEvents: 'none' }}>
      {Array.from({ length: 14 }, (_, index) => (
        <View
          key={index}
          style={{
            height: 3,
            width: '100%',
            backgroundColor: `rgba(255,255,255,${Math.max(0, 1 - index / 13)})`,
          }}
        />
      ))}
    </View>
  );
}

export function TopBar({ onMore }: { onMore?: () => void }) {
  const insets = useSafeAreaInsets();
  const { deviceBattery, deviceVersion, setSimulatorOpen } = useAppState();
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}>
        <View
          style={{
            height: insets.top + 72,
            paddingTop: insets.top,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: AppColors.white,
          }}>
          <CircleButton
            label="返回（当前一级页面不跳转）"
            icon="chevron-back"
            onPress={() => void Haptics.selectionAsync()}
          />
          <View style={{ flex: 1 }} />
          <BatteryButton battery={deviceBattery} onPress={() => setStatusOpen(true)} />
          <CircleButton
            label="更多操作"
            icon="ellipsis-vertical"
            onPress={onMore ?? (() => setSimulatorOpen(true))}
          />
        </View>
        <WhiteFadeMask />
      </View>
      <DeviceStatusCard
        visible={statusOpen}
        onClose={() => setStatusOpen(false)}
        battery={deviceBattery}
        version={deviceVersion}
      />
    </>
  );
}

export const TOP_CONTENT_INSET = 118;

export function useTopContentInset() {
  const insets = useSafeAreaInsets();
  return insets.top + TOP_CONTENT_INSET;
}
