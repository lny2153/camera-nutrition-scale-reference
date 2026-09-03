import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import {
  NUTRIENT_DISPLAY_META,
  NUTRIENT_GROUPS,
  VISIBLE_NUTRIENT_ORDER,
  type DailyGoals,
  type DaySummary,
  type MealRecord,
  type VisibleNutrient,
  sumEntries,
  useAppState,
} from '@/components/app-state';
import { FoodIcon } from '@/components/food-icon';
import { ScreenShell } from '@/components/screen-shell';
import { SegmentedProgressRing } from '@/components/segmented-progress-ring';
import { TopBar, useTopContentInset } from '@/components/top-bar';
import { getFood, type NutritionPer100g } from '@/constants/foods';
import { METRIC_DEFINITIONS, type TrendMetric } from '@/constants/nutrition';
import { AppColors, AppFonts } from '@/constants/theme';

function formatMetric(value: number, metric: TrendMetric) {
  return metric === 'calories' || metric === 'sodium'
    ? String(Math.round(value))
    : value.toFixed(1);
}

function DateStrip({
  days,
  selectedKey,
  onSelect,
  onCalendar,
}: {
  days: DaySummary[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onCalendar: () => void;
}) {
  const visibleDays = days.slice(-5);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20 }}>
      {visibleDays.map((day) => {
        const selected = day.key === selectedKey;
        return (
          <Pressable
            key={day.key}
            accessibilityRole="button"
            accessibilityLabel={`${day.weekLabel}${day.dayLabel}日，${day.calorieExceeded ? '超过目标' : '未超过目标'}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(day.key)}
            style={({ pressed }) => ({
              flex: 1,
              height: 68,
              borderRadius: 22,
              borderWidth: selected ? 0 : 1,
              borderColor: '#C9C9CC',
              backgroundColor: selected ? AppColors.text : AppColors.white,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.62 : 1,
            })}>
            <View
              style={{
                position: 'absolute',
                top: 8,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: day.calorieExceeded ? AppColors.orange : AppColors.green,
              }}
            />
            <Text
              style={{
                fontFamily: AppFonts.regular,
                fontSize: 12,
                color: selected ? AppColors.white : AppColors.textSecondary,
              }}>
              {day.weekLabel}
            </Text>
            <Text
              style={{
                fontFamily: AppFonts.medium,
                fontSize: 14,
                color: selected ? AppColors.white : AppColors.text,
              }}>
              {day.dayLabel}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="快速选择日期"
        onPress={onCalendar}
        style={({ pressed }) => ({
          width: 52,
          height: 68,
          borderRadius: 22,
          backgroundColor: AppColors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.62 : 1,
        })}>
        <Ionicons name="calendar-outline" size={25} />
      </Pressable>
    </View>
  );
}

function CalendarSheet({
  visible,
  days,
  selectedKey,
  onSelect,
  onClose,
}: {
  visible: boolean;
  days: DaySummary[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.24)' }}>
        <Pressable accessibilityLabel="关闭日期选择" onPress={onClose} style={{ flex: 1 }} />
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            alignSelf: 'center',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: AppColors.white,
            padding: 24,
            paddingBottom: 38,
          }}>
          <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 24 }}>快速选择日期</Text>
          <View style={{ marginTop: 18, gap: 8 }}>
            {days.map((day) => (
              <Pressable
                key={day.key}
                accessibilityRole="button"
                accessibilityState={{ selected: day.key === selectedKey }}
                onPress={() => {
                  onSelect(day.key);
                  onClose();
                }}
                style={({ pressed }) => ({
                  height: 54,
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: day.key === selectedKey ? AppColors.surface : AppColors.white,
                  opacity: pressed ? 0.62 : 1,
                })}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: day.calorieExceeded ? AppColors.orange : AppColors.green,
                    marginRight: 12,
                  }}
                />
                <Text style={{ flex: 1, fontFamily: AppFonts.medium, fontSize: 17 }}>
                  {day.weekLabel} · {day.dayLabel} 日
                </Text>
                <Text style={{ fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
                  {day.hasRecords ? `${Math.round(day.nutrition.calories)} kcal` : '无记录'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GoalEditor({
  visible,
  goals,
  onSave,
  onClose,
}: {
  visible: boolean;
  goals: DailyGoals;
  onSave: (goals: DailyGoals) => void;
  onClose: () => void;
}) {
  const [calories, setCalories] = useState(String(goals.calories));
  const [protein, setProtein] = useState(String(goals.protein));
  const [fat, setFat] = useState(String(goals.fat));
  const [carbs, setCarbs] = useState(String(goals.carbs));
  const [sodium, setSodium] = useState(String(goals.sodium));

  useEffect(() => {
    if (!visible) return;
    setCalories(String(goals.calories));
    setProtein(String(goals.protein));
    setFat(String(goals.fat));
    setCarbs(String(goals.carbs));
    setSodium(String(goals.sodium));
  }, [goals, visible]);

  const fields = [
    { label: '每日热量目标', unit: 'kcal', value: calories, setValue: setCalories },
    { label: '每日蛋白质参考目标', unit: 'g', value: protein, setValue: setProtein },
    { label: '每日脂肪参考目标', unit: 'g', value: fat, setValue: setFat },
    { label: '每日碳水化合物参考目标', unit: 'g', value: carbs, setValue: setCarbs },
    { label: '每日钠参考上限', unit: 'mg', value: sodium, setValue: setSodium },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.24)' }}>
          <Pressable
            accessibilityLabel="关闭目标设置"
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            style={{ flex: 1 }}
          />
          <View
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '88%',
              alignSelf: 'center',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              backgroundColor: AppColors.white,
              overflow: 'hidden',
            }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 38 }}>
                <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 24 }}>调整今日目标</Text>
                <Text style={{ marginTop: 8, fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
                  修改会应用于今天，并成为明天起新日期的默认目标；过去日期的目标快照不会改变。
                </Text>
                <View style={{ marginTop: 20, gap: 14 }}>
                  {fields.map((field) => (
                    <View key={field.label}>
                      <Text style={{ fontFamily: AppFonts.medium, fontSize: 15, marginBottom: 7 }}>{field.label}</Text>
                      <View
                        style={{
                          height: 56,
                          borderRadius: 18,
                          backgroundColor: AppColors.surface,
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                        }}>
                        <TextInput
                          accessibilityLabel={field.label}
                          value={field.value}
                          onChangeText={field.setValue}
                          keyboardType="number-pad"
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                          selectTextOnFocus
                          style={{ flex: 1, fontFamily: AppFonts.medium, fontSize: 21 }}
                        />
                        <Text style={{ fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>{field.unit}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="收起数字键盘"
                  onPress={Keyboard.dismiss}
                  style={({ pressed }) => ({
                    height: 40,
                    marginTop: 10,
                    alignSelf: 'flex-end',
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: AppColors.surface,
                    opacity: pressed ? 0.62 : 1,
                  })}>
                  <Ionicons name="chevron-down" size={17} color={AppColors.text} />
                  <Text style={{ fontFamily: AppFonts.medium, fontSize: 14 }}>收起键盘</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="保存今日目标"
                  onPress={() => {
                    onSave({
                      calories: Number(calories) || 2000,
                      protein: Number(protein) || 50,
                      fat: Number(fat) || 78,
                      carbs: Number(carbs) || 275,
                      sodium: Number(sodium) || 2300,
                    });
                    Keyboard.dismiss();
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    height: 56,
                    marginTop: 22,
                    borderRadius: 28,
                    backgroundColor: AppColors.control,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.72 : 1,
                  })}>
                  <Text style={{ color: AppColors.white, fontFamily: AppFonts.medium, fontSize: 17 }}>保存</Text>
                </Pressable>
              </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MealSection({
  meal,
  metric,
  color,
  expanded,
  onToggle,
}: {
  meal: MealRecord;
  metric: TrendMetric;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const definition = METRIC_DEFINITIONS[metric];
  const nutrition = sumEntries(meal.entries);
  return (
    <Animated.View layout={LinearTransition.duration(240)} style={{ paddingHorizontal: 24, marginTop: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 54 }}>
        <View style={{ width: 8, height: 48, borderRadius: 4, backgroundColor: color, marginRight: 14 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 22 }}>{meal.name}</Text>
          <Text style={{ fontFamily: AppFonts.regular, fontSize: 13, color: AppColors.textSecondary }}>
            {meal.time}
          </Text>
        </View>
        <Text selectable style={{ fontFamily: AppFonts.medium, fontSize: 21 }}>
          {formatMetric(nutrition[metric], metric)}{' '}
          <Text style={{ fontFamily: AppFonts.regular, fontSize: 13 }}>{definition.unit}</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? '收起' : '展开'}${meal.name}`}
          onPress={onToggle}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            marginLeft: 10,
            borderRadius: 24,
            backgroundColor: AppColors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={22} />
        </Pressable>
      </View>
      {expanded && (
        <Animated.View entering={FadeIn.duration(180)} style={{ marginTop: 12, gap: 10 }}>
          {meal.entries.map((entry) => {
            const food = getFood(entry.foodId);
            const entryNutrition = sumEntries([entry]);
            const mealMetricTotal = nutrition[metric];
            const contributionPercent = mealMetricTotal > 0
              ? Math.min(100, Math.max(0, (entryNutrition[metric] / mealMetricTotal) * 100))
              : 0;
            return (
              <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FoodIcon food={food} size={30} />
                <Text style={{ width: 78, fontFamily: AppFonts.regular, fontSize: 14 }} numberOfLines={1}>
                  {food.name.replace('（熟）', '')}
                </Text>
                <Text style={{ width: 58, fontFamily: AppFonts.medium, fontSize: 13 }}>{entry.grams} g</Text>
                <View style={{ flex: 1, height: 18, borderRadius: 9, backgroundColor: definition.soft }}>
                  <Animated.View
                    key={`${entry.id}-${metric}`}
                    entering={FadeIn.duration(180)}
                    style={{
                      width: `${contributionPercent}%`,
                      height: '100%',
                      borderRadius: 9,
                      backgroundColor: color,
                    }}
                  />
                </View>
                <Text style={{ width: 68, textAlign: 'right', fontFamily: AppFonts.medium, fontSize: 12 }}>
                  {formatMetric(entryNutrition[metric], metric)} {definition.unit}
                </Text>
              </View>
            );
          })}
          <View style={{ height: 1, backgroundColor: AppColors.separator, marginVertical: 4 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[
              ['碳水', `${Math.round(nutrition.carbs)}g`],
              ['脂肪', `${Math.round(nutrition.fat)}g`],
              ['蛋白质', `${Math.round(nutrition.protein)}g`],
              ['钠', `${Math.round(nutrition.sodium)}mg`],
            ].map(([label, value]) => (
              <View key={label} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: AppFonts.medium, fontSize: 17 }}>{value}</Text>
                <Text style={{ fontFamily: AppFonts.regular, fontSize: 11, color: AppColors.textSecondary }}>{label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function NutritionGrid({
  nutrition,
  visibleNutrients,
}: {
  nutrition: NutritionPer100g;
  visibleNutrients: Set<VisibleNutrient>;
}) {
  const [expanded, setExpanded] = useState(true);
  const visibleInOrder = VISIBLE_NUTRIENT_ORDER.filter((id) => visibleNutrients.has(id));
  const groups = expanded
    ? NUTRIENT_GROUPS.map((group) => ({
        ...group,
        ids: group.ids.filter((id) => visibleNutrients.has(id)),
      })).filter((group) => group.ids.length > 0)
    : [{ ids: visibleInOrder.slice(0, 4), columns: 4 as const }];

  const formatNutrient = (id: VisibleNutrient) => {
    const meta = NUTRIENT_DISPLAY_META[id];
    const value = nutrition[id];
    return meta.decimals === 0 ? String(Math.round(value)) : value.toFixed(meta.decimals);
  };

  return (
    <View style={{ paddingHorizontal: 18, marginTop: 34 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 }}>
        <Ionicons name="git-network-outline" size={19} />
        <Text style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>该日摄入营养成分</Text>
      </View>
      <Animated.View
        layout={LinearTransition.duration(240)}
        style={{
          marginTop: 14,
          borderRadius: 28,
          backgroundColor: AppColors.surfaceSoft,
          paddingTop: 18,
          paddingHorizontal: 10,
          paddingBottom: 42,
          overflow: 'hidden',
        }}>
        {groups.map((group, groupIndex) => (
          <View key={`nutrient-group-${groupIndex}`}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 22 }}>
              {group.ids.map((id) => {
                const meta = NUTRIENT_DISPLAY_META[id];
                return (
                  <View
                    key={id}
                    style={{ width: `${100 / group.columns}%`, alignItems: 'center', minHeight: 56 }}>
                    <Text selectable style={{ fontFamily: AppFonts.medium, fontSize: 20 }}>
                      {formatNutrient(id)}
                      <Text style={{ fontFamily: AppFonts.regular, fontSize: 11 }}>{meta.unit}</Text>
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: 4,
                        fontFamily: AppFonts.regular,
                        fontSize: 10,
                        color: AppColors.textSecondary,
                      }}>
                      {meta.label}
                    </Text>
                  </View>
                );
              })}
            </View>
            {expanded && group.separatorAfter && groupIndex < groups.length - 1 ? (
              <View style={{ height: 1, backgroundColor: '#8E8E93', marginHorizontal: 8, marginVertical: 14 }} />
            ) : null}
          </View>
        ))}
        {!visibleInOrder.length ? (
          <Text style={{ textAlign: 'center', fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
            可在“更多 → 营养成分设置”中打开需要显示的项目
          </Text>
        ) : null}
      </Animated.View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? '收起每日营养成分，仅保留第一排' : '展开全部每日营养成分'}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => ({
          width: 58,
          height: 58,
          borderRadius: 29,
          marginTop: -30,
          alignSelf: 'center',
          backgroundColor: AppColors.white,
          borderWidth: 9,
          borderColor: AppColors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.62 : 1,
        })}>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={AppColors.text} />
      </Pressable>
    </View>
  );
}

function SevenDayChart({ days, metric, selectedKey }: { days: DaySummary[]; metric: TrendMetric; selectedKey: string }) {
  const definition = METRIC_DEFINITIONS[metric];
  const values = days.map((day) => day.nutrition[metric]);
  const maxValue = Math.max(...values, ...days.map((day) => day.goals[metric]), 1);
  return (
    <View style={{ paddingHorizontal: 24, marginTop: 34, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="stats-chart-outline" size={19} />
        <Text style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>近七日{definition.label}趋势</Text>
      </View>
      <View style={{ height: 202, flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginTop: 18 }}>
        {days.map((day, index) => {
          const value = day.nutrition[metric];
          const height = day.hasRecords ? Math.max(12, (value / maxValue) * 142) : 3;
          const selected = day.key === selectedKey;
          return (
            <View key={day.key} style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ fontFamily: AppFonts.medium, fontSize: 10, marginBottom: 6 }}>
                {day.hasRecords ? Math.round(value) : '—'}
              </Text>
              <Animated.View
                layout={LinearTransition.duration(240)}
                style={{
                  width: '72%',
                  height,
                  borderRadius: 10,
                  backgroundColor: day.hasRecords
                    ? definition.palette[index % definition.palette.length]
                    : AppColors.separator,
                }}
              />
              <Text style={{ marginTop: 8, fontFamily: AppFonts.regular, fontSize: 10, color: AppColors.textSecondary }}>
                {day.weekLabel}
              </Text>
              <View
                style={{
                  minWidth: 28,
                  height: 24,
                  borderRadius: 10,
                  backgroundColor: selected ? AppColors.text : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontFamily: AppFonts.medium, fontSize: 10, color: selected ? AppColors.white : AppColors.text }}>
                  {day.dayLabel}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const topContentInset = useTopContentInset();
  const {
    daySummaries,
    selectedDateKey,
    selectedDay,
    visibleNutrients,
    metric,
    selectDate,
    cycleMetric,
    updateGoal,
  } = useAppState();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const definition = METRIC_DEFINITIONS[metric];
  const value = selectedDay.nutrition[metric];
  const target = selectedDay.goals[metric];
  const exceededBy = Math.max(0, value - target);

  useEffect(() => {
    setExpanded(new Set(selectedDay.meals[0] ? [selectedDay.meals[0].id] : []));
  }, [selectedDay.key, selectedDay.meals]);

  return (
    <ScreenShell>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topContentInset + 2, paddingBottom: 30 }}>
          <DateStrip
            days={daySummaries}
            selectedKey={selectedDateKey}
            onSelect={selectDate}
            onCalendar={() => setCalendarOpen(true)}
          />

          <View style={{ paddingHorizontal: 24, marginTop: 28, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: AppFonts.regular, fontSize: 30 }}>
                {selectedDay.isToday ? '今日' : `${selectedDay.weekLabel} ${selectedDay.dayLabel}日`}
              </Text>
              <Text style={{ fontFamily: AppFonts.regular, fontSize: 26 }}>{definition.label}摄入追踪</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`切换追踪项目，当前${definition.label}`}
              onPress={cycleMetric}
              style={({ pressed }) => ({
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: definition.soft,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}>
              <Ionicons name="swap-horizontal" size={26} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 14 }}>
            <SegmentedProgressRing meals={selectedDay.meals} metric={metric} goal={target} />
            <Animated.View key={`${selectedDay.key}-${metric}`} entering={FadeIn.duration(190)} style={{ flex: 1, paddingLeft: 12 }}>
              <Text
                selectable
                style={{
                  fontFamily: AppFonts.medium,
                  fontSize: 34,
                  color: definition.accent,
                  textAlign: 'right',
                  fontVariant: ['tabular-nums'],
                }}>
                {formatMetric(value, metric)}{' '}
                <Text style={{ fontFamily: AppFonts.regular, fontSize: 17 }}>{definition.unit}</Text>
              </Text>
              <Text style={{ fontFamily: AppFonts.regular, fontSize: 20, textAlign: 'right', marginTop: 4 }}>
                目标 {target} {definition.unit}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={selectedDay.isToday ? '调整今日目标' : '历史目标不可修改'}
                disabled={!selectedDay.isToday}
                onPress={() => setGoalOpen(true)}
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: AppColors.surface,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                  opacity: selectedDay.isToday ? (pressed ? 0.6 : 1) : 0.35,
                })}>
                <Ionicons name="create-outline" size={21} />
              </Pressable>
              {metric === 'calories' ? (
                <View style={{ alignSelf: 'flex-end', marginTop: 12, gap: 5 }}>
                  <Text style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>{Math.round(selectedDay.nutrition.carbs)}g 碳水化合物</Text>
                  <Text style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>{Math.round(selectedDay.nutrition.fat)}g 脂肪</Text>
                  <Text style={{ fontFamily: AppFonts.medium, fontSize: 16 }}>{Math.round(selectedDay.nutrition.protein)}g 蛋白质</Text>
                </View>
              ) : (
                <Text style={{ marginTop: 14, textAlign: 'right', fontFamily: AppFonts.medium, color: exceededBy ? AppColors.danger : AppColors.textSecondary }}>
                  {exceededBy > 0 ? `已超出 ${Math.round(exceededBy)} ${definition.unit}` : `剩余 ${Math.max(0, Math.round(target - value))} ${definition.unit}`}
                </Text>
              )}
            </Animated.View>
          </View>

          {!selectedDay.meals.length ? (
            <View
              style={{
                marginHorizontal: 24,
                marginTop: 26,
                borderRadius: 28,
                backgroundColor: AppColors.surfaceSoft,
                padding: 26,
                alignItems: 'center',
              }}>
              <Ionicons name="restaurant-outline" size={34} color={AppColors.textSecondary} />
              <Text style={{ marginTop: 10, fontFamily: AppFonts.medium, fontSize: 18 }}>这一天还没有完成的餐</Text>
              <Text style={{ marginTop: 5, fontFamily: AppFonts.regular, fontSize: 13, color: AppColors.textSecondary }}>
                完成一次备餐后，餐次和营养会自动出现在这里
              </Text>
            </View>
          ) : (
            selectedDay.meals.map((meal, index) => (
              <MealSection
                key={meal.id}
                meal={meal}
                metric={metric}
                expanded={expanded.has(meal.id)}
                color={definition.palette[index % definition.palette.length]}
                onToggle={() =>
                  setExpanded((current) => {
                    const next = new Set(current);
                    if (next.has(meal.id)) next.delete(meal.id);
                    else next.add(meal.id);
                    return next;
                  })
                }
              />
            ))
          )}

          <NutritionGrid nutrition={selectedDay.nutrition} visibleNutrients={visibleNutrients} />
          <SevenDayChart days={daySummaries} metric={metric} selectedKey={selectedDateKey} />
        </ScrollView>
        <TopBar />
        <CalendarSheet
          visible={calendarOpen}
          days={daySummaries}
          selectedKey={selectedDateKey}
          onSelect={selectDate}
          onClose={() => setCalendarOpen(false)}
        />
        <GoalEditor
          visible={goalOpen}
          goals={selectedDay.goals}
          onClose={() => setGoalOpen(false)}
          onSave={(goals) => {
            updateGoal('calories', goals.calories);
            updateGoal('protein', goals.protein);
            updateGoal('fat', goals.fat);
            updateGoal('carbs', goals.carbs);
            updateGoal('sodium', goals.sodium);
          }}
        />
      </View>
    </ScreenShell>
  );
}
