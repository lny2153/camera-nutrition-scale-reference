import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { WEIGHT_UNITS, useAppState } from '@/components/app-state';
import {
  FoodPickerSheet,
  type FoodPickerMode,
} from '@/components/food-picker-sheet';
import { FoodIcon } from '@/components/food-icon';
import {
  ARC_GEOMETRY,
  SegmentedMealArc,
  polarPoint,
} from '@/components/segmented-meal-arc';
import { ScreenShell } from '@/components/screen-shell';
import { TopBar, useTopContentInset } from '@/components/top-bar';
import type { Food } from '@/constants/foods';
import {
  MEASUREMENT_METRICS,
  METRIC_DEFINITIONS,
} from '@/constants/nutrition';
import { AppColors, AppFonts } from '@/constants/theme';
import { formatOunces, formatPoundsOunces } from '@/constants/weight-units';

function RoundButton({
  label,
  icon,
  onPress,
  disabled = false,
  size = 68,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: AppColors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.34 : pressed ? 0.58 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}>
      <Ionicons name={icon} size={size * 0.4} color={AppColors.text} />
    </Pressable>
  );
}

function SwitchButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: AppColors.white,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}>
      <Ionicons name="swap-vertical" size={27} color={AppColors.text} />
    </Pressable>
  );
}

function ScanCorners() {
  return (
    <Svg width={142} height={132} viewBox="0 0 142 132" style={{ position: 'absolute' }}>
      <Path d="M 4 31 L 4 10 Q 4 4 10 4 L 31 4" fill="none" stroke={AppColors.green} strokeWidth={5} strokeLinecap="round" />
      <Path d="M 111 4 L 132 4 Q 138 4 138 10 L 138 31" fill="none" stroke={AppColors.green} strokeWidth={5} strokeLinecap="round" />
      <Path d="M 4 101 L 4 122 Q 4 128 10 128 L 31 128" fill="none" stroke={AppColors.green} strokeWidth={5} strokeLinecap="round" />
      <Path d="M 111 128 L 132 128 Q 138 128 138 122 L 138 101" fill="none" stroke={AppColors.green} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

function RecognitionCard({
  food,
  status,
  isFavorite,
  onSearch,
  onFavorites,
  onFavorite,
  cardRef,
}: {
  food: Food;
  status: 'scanning' | 'stable' | 'empty';
  isFavorite: boolean;
  onSearch: () => void;
  onFavorites: () => void;
  onFavorite: () => void;
  cardRef: React.RefObject<View | null>;
}) {
  const waiting = status !== 'stable';

  return (
    <View
      ref={cardRef}
      style={{
        width: '35%',
        minWidth: 118,
        height: 278,
        borderRadius: 32,
        overflow: 'hidden',
        alignItems: 'center',
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: waiting ? 278 : 190,
          borderRadius: 32,
          backgroundColor: AppColors.surface,
        }}
      />
      <View style={{ height: 145, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {status === 'stable' && <ScanCorners />}
        <Animated.View
          key={`${food.id}-${status}`}
          entering={FadeIn.duration(210)}
          exiting={FadeOut.duration(130)}
          style={{ alignItems: 'center', justifyContent: 'center' }}>
          {waiting ? (
            <View
              accessibilityLabel={status === 'scanning' ? '正在模拟识别食材' : '等待模拟输入'}
              style={{
                width: 126,
                height: 108,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: AppColors.surface,
              }}>
              <Ionicons
                name={status === 'scanning' ? 'scan-outline' : 'camera-outline'}
                size={54}
                color={AppColors.textSecondary}
              />
            </View>
          ) : (
            <FoodIcon food={food} size={116} />
          )}
        </Animated.View>
      </View>
      <Text
        numberOfLines={1}
        style={{
          maxWidth: '88%',
          marginTop: 2,
          fontFamily: AppFonts.demiBold,
          fontSize: 19,
          color: AppColors.text,
        }}>
        {status === 'scanning' ? '识别中…' : status === 'empty' ? '等待识别' : food.name}
      </Text>
      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="手动搜索食材"
          onPress={onSearch}
          style={({ pressed }) => ({
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: AppColors.white,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}>
          <Ionicons name="search" size={25} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={waiting ? '打开食材收藏夹' : isFavorite ? '取消收藏' : '收藏食材'}
          onPress={waiting ? onFavorites : onFavorite}
          style={({ pressed }) => ({
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: AppColors.white,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}>
          <Ionicons
            name={waiting ? 'folder-outline' : isFavorite ? 'star' : 'star-outline'}
            size={27}
            color={waiting ? AppColors.text : AppColors.yellow}
          />
        </Pressable>
      </View>
    </View>
  );
}

function DataCard({
  value,
  unit,
  backgroundColor,
  switchLabel,
  onSwitch,
  overlayLabel,
}: {
  value: string;
  unit: string;
  backgroundColor: string;
  switchLabel: string;
  onSwitch: () => void;
  overlayLabel: string | null;
}) {
  return (
    <View
      style={{
        height: 132,
        borderRadius: 34,
        backgroundColor,
        paddingLeft: 26,
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <Text
        selectable
        style={{
          fontFamily: AppFonts.medium,
          fontSize: value === '-' ? 34 : 58,
          lineHeight: 66,
          color: AppColors.text,
          fontVariant: ['tabular-nums'],
          opacity: overlayLabel ? 0.2 : 1,
        }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: AppFonts.regular,
          fontSize: 22,
          color: AppColors.text,
          opacity: overlayLabel ? 0 : 1,
        }}>
        /{unit}
      </Text>
      {overlayLabel && (
        <Animated.Text
          key={overlayLabel}
          entering={FadeInDown.duration(180)}
          exiting={FadeOut.duration(120)}
          style={{
            position: 'absolute',
            left: 20,
            right: 70,
            textAlign: 'center',
            fontFamily: AppFonts.demiBold,
            fontSize: overlayLabel.length > 4 ? 24 : 34,
            color: AppColors.text,
          }}>
          {overlayLabel}
        </Animated.Text>
      )}
      <View style={{ position: 'absolute', right: 10 }}>
        <SwitchButton label={switchLabel} onPress={onSwitch} />
      </View>
    </View>
  );
}

function FinishMealConfirmation({
  visible,
  itemCount,
  calories,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  itemCount: number;
  calories: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.28)' }}>
        <Pressable accessibilityLabel="取消结束备餐" onPress={onCancel} style={{ flex: 1 }} />
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            alignSelf: 'center',
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            backgroundColor: AppColors.white,
            padding: 24,
            paddingBottom: 38,
          }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: AppColors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="checkmark-circle-outline" size={29} color={AppColors.text} />
          </View>
          <Text style={{ marginTop: 16, fontFamily: AppFonts.demiBold, fontSize: 25, color: AppColors.text }}>
            结束此次备餐？
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: AppFonts.regular,
              fontSize: 15,
              lineHeight: 22,
              color: AppColors.textSecondary,
            }}>
            本餐包含 {itemCount} 种食材，共 {Math.round(calories)} kcal。确认后将保存到趋势页，并清空当前备餐内容。
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="继续备餐"
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1,
                height: 56,
                borderRadius: 28,
                backgroundColor: AppColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.65 : 1,
              })}>
              <Text style={{ fontFamily: AppFonts.medium, fontSize: 17, color: AppColors.text }}>继续备餐</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="确认结束备餐"
              onPress={onConfirm}
              style={({ pressed }) => ({
                flex: 1,
                height: 56,
                borderRadius: 28,
                backgroundColor: AppColors.control,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.72 : 1,
              })}>
              <Text style={{ fontFamily: AppFonts.medium, fontSize: 17, color: AppColors.white }}>确认结束</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FlyingFood({ food, style }: { food: Food; style: object }) {
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 90,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: AppColors.white,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <FoodIcon food={food} size={48} />
    </Animated.View>
  );
}

export default function MeasurementScreen() {
  const topContentInset = useTopContentInset();
  const {
    selectedFood,
    currentWeight,
    currentNutrition,
    scanStatus,
    weightUnit,
    metric,
    draftEntries,
    draftNutrition,
    foods,
    favorites,
    setSimulatorOpen,
    selectFood,
    cycleWeightUnit,
    cycleMetric,
    tare,
    addCurrent,
    undo,
    finishMeal,
    toggleFavorite,
  } = useAppState();
  const [notice, setNotice] = useState('');
  const [weightOverlay, setWeightOverlay] = useState<string | null>(null);
  const [metricOverlay, setMetricOverlay] = useState<string | null>(null);
  const [flyingFood, setFlyingFood] = useState<Food | null>(null);
  const [adding, setAdding] = useState(false);
  const [foodPickerMode, setFoodPickerMode] = useState<FoodPickerMode | null>(null);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const rootRef = useRef<View>(null);
  const scanRef = useRef<View>(null);
  const arcRef = useRef<View>(null);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(1);

  const flyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: flyX.value - 29 },
      { translateY: flyY.value - 29 },
      { scale: flyScale.value },
    ],
  }));

  const definition = METRIC_DEFINITIONS[metric];
  const unitCompatible = weightUnit !== 'mL' || !!selectedFood.densityGPerMl;
  const displayedWeightValue = !unitCompatible
    ? '-'
    : weightUnit === 'g'
      ? String(Math.round(currentWeight))
      : weightUnit === 'oz'
        ? formatOunces(currentWeight)
        : weightUnit === 'lb:oz'
          ? formatPoundsOunces(currentWeight)
          : selectedFood.densityGPerMl
            ? (currentWeight / selectedFood.densityGPerMl).toFixed(1)
            : '0.0';
  const rawMetricValue = currentNutrition[metric];
  const metricValue = !unitCompatible
    ? '-'
    : metric === 'calories' || metric === 'sodium'
      ? String(Math.round(rawMetricValue))
      : rawMetricValue.toFixed(1);
  const canAdd = scanStatus === 'stable' && currentWeight > 0 && unitCompatible && !adding;

  const animateWeightUnit = () => {
    if (weightOverlay) return;
    const nextUnit = WEIGHT_UNITS[(WEIGHT_UNITS.indexOf(weightUnit) + 1) % WEIGHT_UNITS.length];
    setWeightOverlay(weightUnit);
    setTimeout(() => {
      cycleWeightUnit();
      setWeightOverlay(nextUnit);
    }, 170);
    setTimeout(() => setWeightOverlay(null), 520);
  };

  const animateMetric = () => {
    if (metricOverlay) return;
    const nextMetric = MEASUREMENT_METRICS[
      (MEASUREMENT_METRICS.indexOf(metric) + 1) % MEASUREMENT_METRICS.length
    ];
    setMetricOverlay(METRIC_DEFINITIONS[metric].label);
    setTimeout(() => {
      cycleMetric();
      setMetricOverlay(METRIC_DEFINITIONS[nextMetric].label);
    }, 170);
    setTimeout(() => setMetricOverlay(null), 560);
  };

  const animateAdd = () => {
    if (!canAdd || !rootRef.current || !scanRef.current || !arcRef.current) return;
    setAdding(true);
    setFlyingFood(selectedFood);
    rootRef.current.measureInWindow((rootX, rootY) => {
      scanRef.current?.measureInWindow((scanX, scanY, scanWidth, scanHeight) => {
        arcRef.current?.measureInWindow((arcX, arcY, arcWidth, arcHeight) => {
          const arcStart = polarPoint(ARC_GEOMETRY.startAngle);
          flyX.value = scanX - rootX + scanWidth / 2;
          flyY.value = scanY - rootY + scanHeight * 0.34;
          flyScale.value = 1;
          flyX.value = withTiming(
            arcX - rootX + (arcStart.x / ARC_GEOMETRY.width) * arcWidth,
            { duration: 270, easing: Easing.bezier(0.3, 0, 0.25, 1) },
          );
          flyY.value = withTiming(
            arcY - rootY + (arcStart.y / ARC_GEOMETRY.height) * arcHeight,
            { duration: 270, easing: Easing.bezier(0.3, 0, 0.25, 1) },
          );
          flyScale.value = withTiming(0.78, { duration: 270 });
        });
      });
    });
    setTimeout(() => {
      const added = addCurrent();
      setNotice(added ? `${selectedFood.name}已加入本餐` : '请先完成识别并输入有效重量');
    }, 270);
    setTimeout(() => {
      setFlyingFood(null);
      setAdding(false);
    }, 700);
  };

  return (
    <ScreenShell>
      <View ref={rootRef} style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topContentInset + 14, paddingBottom: 28 }}>
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: AppFonts.regular, fontSize: 30, color: AppColors.text }}>
              实时测量
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 26 }}>
              <RecognitionCard
                food={selectedFood}
                status={scanStatus}
                isFavorite={favorites.has(selectedFood.id)}
                onSearch={() => setFoodPickerMode('search')}
                onFavorites={() => setFoodPickerMode('favorites')}
                onFavorite={() => toggleFavorite(selectedFood.id)}
                cardRef={scanRef}
              />
              <View style={{ flex: 1, gap: 14 }}>
                <DataCard
                  value={displayedWeightValue}
                  unit={weightUnit}
                  backgroundColor={AppColors.greenSoft}
                  switchLabel={`切换重量单位，当前 ${weightUnit}`}
                  onSwitch={animateWeightUnit}
                  overlayLabel={weightOverlay}
                />
                <DataCard
                  value={metricValue}
                  unit={definition.unit}
                  backgroundColor={definition.soft}
                  switchLabel={`切换查看项目，当前${definition.label}`}
                  onSwitch={animateMetric}
                  overlayLabel={metricOverlay}
                />
              </View>
            </View>

            <View ref={arcRef} style={{ marginTop: 24 }}>
              <SegmentedMealArc entries={draftEntries} metric={metric} />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 28,
                marginTop: 0,
              }}>
              <RoundButton label="去皮并将当前重量归零" icon="archive-outline" onPress={tare} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="将当前食材加入本餐"
                accessibilityState={{ disabled: !canAdd }}
                disabled={!canAdd}
                onPress={animateAdd}
                style={({ pressed }) => ({
                  width: 122,
                  height: 122,
                  borderRadius: 61,
                  backgroundColor: AppColors.control,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !canAdd ? 0.38 : pressed ? 0.72 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <Ionicons name="add" size={72} color="white" />
              </Pressable>
              <RoundButton
                label="撤销上一次加入"
                icon="arrow-undo"
                onPress={undo}
                disabled={!draftEntries.length}
              />
            </View>

            {!!notice && (
              <Animated.Text
                key={notice}
                entering={FadeIn.duration(180)}
                style={{
                  marginTop: 14,
                  textAlign: 'center',
                  fontFamily: AppFonts.regular,
                  fontSize: 14,
                  color: AppColors.textSecondary,
                }}>
                {notice}
              </Animated.Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="完成备餐并保存到趋势"
              accessibilityState={{ disabled: !draftEntries.length }}
              disabled={!draftEntries.length}
              onPress={() => setFinishConfirmOpen(true)}
              style={({ pressed }) => ({
                height: 66,
                marginTop: 24,
                borderRadius: 33,
                backgroundColor: AppColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !draftEntries.length ? 0.46 : pressed ? 0.68 : 1,
              })}>
              <Text style={{ fontFamily: AppFonts.regular, fontSize: 21, color: AppColors.text }}>
                备餐完成
              </Text>
            </Pressable>
          </View>
        </ScrollView>
        <TopBar onMore={() => setSimulatorOpen(true)} />
        {flyingFood && <FlyingFood food={flyingFood} style={flyStyle} />}
        <FoodPickerSheet
          visible={!!foodPickerMode}
          mode={foodPickerMode ?? 'search'}
          foods={foods}
          favorites={favorites}
          selectedFoodId={selectedFood.id}
          onSelect={(food) => {
            selectFood(food);
            setFoodPickerMode(null);
          }}
          onClose={() => setFoodPickerMode(null)}
        />
        <FinishMealConfirmation
          visible={finishConfirmOpen}
          itemCount={draftEntries.length}
          calories={draftNutrition.calories}
          onCancel={() => setFinishConfirmOpen(false)}
          onConfirm={() => {
            const saved = finishMeal();
            setFinishConfirmOpen(false);
            setNotice(saved ? '本餐已保存，可前往趋势页查看' : '请至少加入一种食材');
          }}
        />
      </View>
    </ScreenShell>
  );
}
