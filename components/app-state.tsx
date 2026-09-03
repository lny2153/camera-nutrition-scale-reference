import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { FOODS, getFood, scaleNutrition, type Food, type NutritionPer100g } from '@/constants/foods';
import { MEASUREMENT_METRICS, type MeasurementMetric } from '@/constants/nutrition';

export type { MeasurementMetric, TrendMetric } from '@/constants/nutrition';

export const WEIGHT_UNITS = ['g', 'oz', 'lb:oz', 'mL'] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];
export type ScanStatus = 'scanning' | 'stable' | 'empty';
export type GoalMetric = MeasurementMetric;
export type VisibleNutrient = Exclude<keyof NutritionPer100g, 'calories' | 'carbs' | 'fat' | 'protein'>;

export const VISIBLE_NUTRIENT_ORDER: VisibleNutrient[] = [
  'saturatedFat',
  'sugar',
  'fiber',
  'betaCarotene',
  'cholesterol',
  'niacin',
  'retinolEquivalent',
  'vitaminA',
  'vitaminB1',
  'vitaminB2',
  'vitaminC',
  'vitaminD',
  'vitaminE',
  'potassium',
  'sodium',
  'calcium',
  'magnesium',
  'iron',
  'zinc',
  'copper',
  'manganese',
  'phosphorus',
  'selenium',
];

export const NUTRIENT_DISPLAY_META: Record<
  VisibleNutrient,
  { label: string; unit: 'g' | 'mg' | 'μg'; decimals: number }
> = {
  saturatedFat: { label: '饱和脂肪', unit: 'g', decimals: 1 },
  sugar: { label: '糖类', unit: 'g', decimals: 1 },
  fiber: { label: '膳食纤维', unit: 'g', decimals: 1 },
  betaCarotene: { label: '胡萝卜素', unit: 'μg', decimals: 0 },
  cholesterol: { label: '胆固醇', unit: 'mg', decimals: 0 },
  niacin: { label: '烟酸', unit: 'mg', decimals: 1 },
  retinolEquivalent: { label: '视黄醇当量', unit: 'μg', decimals: 0 },
  vitaminA: { label: '维生素 A', unit: 'μg', decimals: 0 },
  vitaminB1: { label: '维生素 B1', unit: 'mg', decimals: 1 },
  vitaminB2: { label: '维生素 B2', unit: 'mg', decimals: 1 },
  vitaminC: { label: '维生素 C', unit: 'mg', decimals: 1 },
  vitaminD: { label: '维生素 D', unit: 'μg', decimals: 1 },
  vitaminE: { label: '维生素 E', unit: 'mg', decimals: 1 },
  potassium: { label: '钾', unit: 'mg', decimals: 0 },
  sodium: { label: '钠', unit: 'mg', decimals: 0 },
  calcium: { label: '钙', unit: 'mg', decimals: 0 },
  magnesium: { label: '镁', unit: 'mg', decimals: 0 },
  iron: { label: '铁', unit: 'mg', decimals: 1 },
  zinc: { label: '锌', unit: 'mg', decimals: 1 },
  copper: { label: '铜', unit: 'mg', decimals: 1 },
  manganese: { label: '锰', unit: 'mg', decimals: 1 },
  phosphorus: { label: '磷', unit: 'mg', decimals: 0 },
  selenium: { label: '硒', unit: 'μg', decimals: 0 },
};

export const NUTRIENT_GROUPS: {
  ids: VisibleNutrient[];
  columns: 3 | 4;
  separatorAfter?: boolean;
}[] = [
  { ids: ['saturatedFat', 'sugar', 'fiber', 'betaCarotene'], columns: 4 },
  { ids: ['cholesterol', 'niacin', 'retinolEquivalent'], columns: 3, separatorAfter: true },
  { ids: ['vitaminA', 'vitaminB1', 'vitaminB2'], columns: 3 },
  { ids: ['vitaminC', 'vitaminD', 'vitaminE'], columns: 3, separatorAfter: true },
  { ids: ['potassium', 'sodium', 'calcium'], columns: 3 },
  { ids: ['magnesium', 'iron', 'zinc', 'copper'], columns: 4 },
  { ids: ['manganese', 'phosphorus', 'selenium'], columns: 3 },
];

export type MealEntry = {
  id: string;
  foodId: string;
  grams: number;
};

export type MealRecord = {
  id: string;
  name: string;
  time: string;
  dateKey: string;
  entries: MealEntry[];
};

export type DailyGoals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
};

export type DaySummary = {
  key: string;
  weekLabel: string;
  dayLabel: string;
  isToday: boolean;
  meals: MealRecord[];
  nutrition: NutritionPer100g;
  goals: DailyGoals;
  hasRecords: boolean;
  calorieExceeded: boolean;
};

const TODAY_KEY = '2026-08-03';
const DAY_DEFINITIONS = [
  { key: '2026-07-28', weekLabel: '周二', dayLabel: '28' },
  { key: '2026-07-29', weekLabel: '周三', dayLabel: '29' },
  { key: '2026-07-30', weekLabel: '周四', dayLabel: '30' },
  { key: '2026-07-31', weekLabel: '周五', dayLabel: '31' },
  { key: '2026-08-01', weekLabel: '周六', dayLabel: '1' },
  { key: '2026-08-02', weekLabel: '周日', dayLabel: '2' },
  { key: TODAY_KEY, weekLabel: '周一', dayLabel: '3' },
] as const;

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 50,
  fat: 78,
  carbs: 275,
  sodium: 2300,
};
const GOAL_PREFERENCES_STORAGE_KEY = 'calorie-scale.goal-preferences.v1';

const parseGoalPreferences = (stored: string | null): DailyGoals => {
  try {
    if (!stored) return { ...DEFAULT_GOALS };
    const parsed = JSON.parse(stored) as Partial<DailyGoals>;
    return {
      calories: Number(parsed.calories) > 0 ? Number(parsed.calories) : DEFAULT_GOALS.calories,
      protein: Number(parsed.protein) > 0 ? Number(parsed.protein) : DEFAULT_GOALS.protein,
      fat: Number(parsed.fat) > 0 ? Number(parsed.fat) : DEFAULT_GOALS.fat,
      carbs: Number(parsed.carbs) > 0 ? Number(parsed.carbs) : DEFAULT_GOALS.carbs,
      sodium: Number(parsed.sodium) > 0 ? Number(parsed.sodium) : DEFAULT_GOALS.sodium,
    };
  } catch {
    return { ...DEFAULT_GOALS };
  }
};

const persistGoalPreferences = (goals: DailyGoals) => {
  void AsyncStorage.setItem(GOAL_PREFERENCES_STORAGE_KEY, JSON.stringify(goals)).catch(() => {
    // Storage failure should not block editing goals during the current session.
  });
};

const makeEntry = (foodId: string, grams: number, id = `${foodId}-${grams}`): MealEntry => ({
  id,
  foodId,
  grams,
});

const makeMeal = (
  dateKey: string,
  index: number,
  time: string,
  entries: [string, number][],
): MealRecord => ({
  id: `${dateKey}-meal-${index}`,
  name: `第${index}餐`,
  time,
  dateKey,
  entries: entries.map(([foodId, grams], entryIndex) =>
    makeEntry(foodId, grams, `${dateKey}-${index}-${entryIndex}-${foodId}`),
  ),
});

const seedMeals: Record<string, MealRecord[]> = {
  '2026-07-28': [],
  '2026-07-29': [],
  '2026-07-30': [
    makeMeal('2026-07-30', 1, '08:10', [
      ['egg', 200], ['quinoa', 300], ['avocado', 150], ['apple', 200],
    ]),
    makeMeal('2026-07-30', 2, '12:36', [
      ['chicken', 300], ['sweet-potato', 300], ['broccoli', 200], ['cheese', 100],
    ]),
    makeMeal('2026-07-30', 3, '18:42', [
      ['salmon', 200], ['potato', 250], ['pepper', 150],
    ]),
  ],
  '2026-07-31': [
    makeMeal('2026-07-31', 1, '10:24', [
      ['chicken', 200], ['lettuce', 200], ['tomato', 300], ['avocado', 150],
    ]),
    makeMeal('2026-07-31', 2, '18:05', [
      ['salmon', 200], ['potato', 250], ['broccoli', 200],
    ]),
  ],
  '2026-08-01': [
    makeMeal('2026-08-01', 1, '08:45', [
      ['egg', 200], ['quinoa', 400], ['cheese', 100],
    ]),
    makeMeal('2026-08-01', 2, '13:12', [
      ['beef', 300], ['potato', 300], ['corn', 200],
    ]),
    makeMeal('2026-08-01', 3, '19:08', [
      ['salmon', 200], ['avocado', 150], ['chickpea', 200],
    ]),
  ],
  '2026-08-02': [
    makeMeal('2026-08-02', 1, '11:18', [
      ['tuna', 250], ['quinoa', 300], ['avocado', 100], ['cucumber', 200],
    ]),
    makeMeal('2026-08-02', 2, '18:28', [
      ['shrimp', 250], ['sweet-potato', 300], ['cheese', 80], ['spinach', 150],
    ]),
  ],
  [TODAY_KEY]: [],
};

const emptyNutrition = (): NutritionPer100g =>
  Object.fromEntries(Object.keys(FOODS[0].nutrition).map((key) => [key, 0])) as NutritionPer100g;

export const sumEntries = (entries: MealEntry[]) =>
  entries.reduce((total, entry) => {
    const nutrition = scaleNutrition(getFood(entry.foodId), entry.grams);
    (Object.keys(total) as (keyof NutritionPer100g)[]).forEach((key) => {
      total[key] += nutrition[key];
    });
    return total;
  }, emptyNutrition());

export const sumMeals = (meals: MealRecord[]) => sumEntries(meals.flatMap((meal) => meal.entries));

type AppStateValue = {
  foods: Food[];
  selectedFood: Food;
  currentWeight: number;
  currentNutrition: NutritionPer100g;
  scanStatus: ScanStatus;
  weightUnit: WeightUnit;
  metric: MeasurementMetric;
  draftEntries: MealEntry[];
  draftNutrition: NutritionPer100g;
  meals: MealRecord[];
  todayNutrition: NutritionPer100g;
  dailyGoal: number;
  daySummaries: DaySummary[];
  selectedDateKey: string;
  selectedDay: DaySummary;
  favorites: Set<string>;
  visibleNutrients: Set<VisibleNutrient>;
  simulatorOpen: boolean;
  deviceBattery: number;
  deviceVersion: string;
  setSimulatorOpen: (open: boolean) => void;
  scanFood: (food: Food, grams: number) => void;
  selectFood: (food: Food) => void;
  setCurrentWeight: (grams: number) => void;
  cycleWeightUnit: () => void;
  cycleMetric: () => void;
  tare: () => void;
  addCurrent: () => boolean;
  undo: () => void;
  finishMeal: () => boolean;
  toggleFavorite: (foodId: string) => void;
  toggleVisibleNutrient: (nutrient: VisibleNutrient) => void;
  selectDate: (dateKey: string) => void;
  updateGoal: (metric: GoalMetric, value: number) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [selectedFood, setSelectedFood] = useState(() => getFood('apple'));
  const [currentWeight, setCurrentWeightState] = useState(0);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('empty');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('g');
  const [metric, setMetric] = useState<MeasurementMetric>('calories');
  const [draftEntries, setDraftEntries] = useState<MealEntry[]>([]);
  const [additionHistory, setAdditionHistory] = useState<MealEntry[]>([]);
  const [mealsByDay, setMealsByDay] = useState<Record<string, MealRecord[]>>(seedMeals);
  const [goalPreferences, setGoalPreferences] = useState<DailyGoals>({ ...DEFAULT_GOALS });
  const [goalsByDay, setGoalsByDay] = useState<Record<string, DailyGoals>>(() =>
    Object.fromEntries(
      DAY_DEFINITIONS.map(({ key }) => [
        key,
        key === TODAY_KEY ? { ...goalPreferences } : { ...DEFAULT_GOALS },
      ]),
    ),
  );
  const [selectedDateKey, setSelectedDateKey] = useState(TODAY_KEY);
  const [favorites, setFavorites] = useState(() => new Set(['apple', 'avocado']));
  const [visibleNutrients, setVisibleNutrients] = useState<Set<VisibleNutrient>>(
    () => new Set(VISIBLE_NUTRIENT_ORDER),
  );
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(GOAL_PREFERENCES_STORAGE_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const savedGoals = parseGoalPreferences(stored);
        setGoalPreferences(savedGoals);
        setGoalsByDay((current) => ({ ...current, [TODAY_KEY]: savedGoals }));
      })
      .catch(() => {
        // Keep the in-memory defaults when local preferences cannot be read.
      });
    return () => {
      active = false;
    };
  }, []);

  const currentNutrition = useMemo(
    () => scaleNutrition(selectedFood, currentWeight),
    [currentWeight, selectedFood],
  );
  const draftNutrition = useMemo(() => sumEntries(draftEntries), [draftEntries]);
  const meals = useMemo(() => mealsByDay[TODAY_KEY] ?? [], [mealsByDay]);
  const todayNutrition = useMemo(() => sumMeals(meals), [meals]);

  const daySummaries = useMemo<DaySummary[]>(
    () =>
      DAY_DEFINITIONS.map((definition) => {
        const dayMeals = mealsByDay[definition.key] ?? [];
        const nutrition = sumMeals(dayMeals);
        const goals = goalsByDay[definition.key] ?? goalPreferences;
        return {
          ...definition,
          isToday: definition.key === TODAY_KEY,
          meals: dayMeals,
          nutrition,
          goals,
          hasRecords: dayMeals.length > 0,
          calorieExceeded: nutrition.calories > goals.calories,
        };
      }),
    [goalPreferences, goalsByDay, mealsByDay],
  );

  const selectedDay =
    daySummaries.find((day) => day.key === selectedDateKey) ?? daySummaries[daySummaries.length - 1];

  const setCurrentWeight = (grams: number) => {
    const safeGrams = Math.min(9999, Math.max(0, Math.round(grams || 0)));
    setCurrentWeightState(safeGrams);
    setScanStatus(safeGrams > 0 ? 'stable' : 'empty');
  };

  const scanFood = (food: Food, grams: number) => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setSelectedFood(food);
    setCurrentWeightState(0);
    setScanStatus('scanning');
    setSimulatorOpen(false);
    scanTimer.current = setTimeout(() => {
      const safeGrams = Math.min(9999, Math.max(0, Math.round(grams)));
      setCurrentWeightState(safeGrams);
      setScanStatus(safeGrams > 0 ? 'stable' : 'empty');
      void Haptics.selectionAsync();
    }, 650);
  };

  const selectFood = (food: Food) => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setSelectedFood(food);
    setScanStatus('stable');
    setSimulatorOpen(false);
    void Haptics.selectionAsync();
  };

  const tare = () => {
    setCurrentWeightState(0);
    setScanStatus('empty');
    void Haptics.selectionAsync();
  };

  const addCurrent = () => {
    if (scanStatus !== 'stable' || currentWeight <= 0) return false;
    const entry = makeEntry(selectedFood.id, currentWeight, `${selectedFood.id}-${Date.now()}`);
    setDraftEntries((current) => {
      const existing = current.find((item) => item.foodId === entry.foodId);
      if (!existing) return [...current, entry];
      return current.map((item) =>
        item.foodId === entry.foodId ? { ...item, grams: item.grams + entry.grams } : item,
      );
    });
    setAdditionHistory((current) => [...current, entry]);
    setCurrentWeightState(0);
    setScanStatus('empty');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const undo = () => {
    const latest = additionHistory[additionHistory.length - 1];
    if (!latest) return;
    setAdditionHistory((current) => current.slice(0, -1));
    setDraftEntries((current) =>
      current
        .map((item) =>
          item.foodId === latest.foodId ? { ...item, grams: Math.max(0, item.grams - latest.grams) } : item,
        )
        .filter((item) => item.grams > 0),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const finishMeal = () => {
    if (!draftEntries.length) return false;
    const now = new Date();
    const record: MealRecord = {
      id: `meal-${Date.now()}`,
      name: `第${meals.length + 1}餐`,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      dateKey: TODAY_KEY,
      entries: draftEntries,
    };
    setMealsByDay((current) => ({
      ...current,
      [TODAY_KEY]: [...(current[TODAY_KEY] ?? []), record],
    }));
    setDraftEntries([]);
    setAdditionHistory([]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(foodId)) next.delete(foodId);
      else next.add(foodId);
      return next;
    });
    void Haptics.selectionAsync();
  };

  const toggleVisibleNutrient = (nutrient: VisibleNutrient) => {
    setVisibleNutrients((current) => {
      const next = new Set(current);
      if (next.has(nutrient)) next.delete(nutrient);
      else next.add(nutrient);
      return next;
    });
  };

  const updateGoal = (goalMetric: GoalMetric, value: number) => {
    if (selectedDateKey !== TODAY_KEY) return;
    const rounded = Math.max(1, Math.round(value));
    setGoalPreferences((current) => {
      const next = { ...current, [goalMetric]: rounded };
      persistGoalPreferences(next);
      return next;
    });
    setGoalsByDay((current) => ({
      ...current,
      [TODAY_KEY]: { ...(current[TODAY_KEY] ?? goalPreferences), [goalMetric]: rounded },
    }));
  };

  const value: AppStateValue = {
    foods: FOODS,
    selectedFood,
    currentWeight,
    currentNutrition,
    scanStatus,
    weightUnit,
    metric,
    draftEntries,
    draftNutrition,
    meals,
    todayNutrition,
    dailyGoal: goalsByDay[TODAY_KEY]?.calories ?? goalPreferences.calories,
    daySummaries,
    selectedDateKey,
    selectedDay,
    favorites,
    visibleNutrients,
    simulatorOpen,
    deviceBattery: 82,
    deviceVersion: '0.1.0',
    setSimulatorOpen,
    scanFood,
    selectFood,
    setCurrentWeight,
    cycleWeightUnit: () =>
      setWeightUnit((current) =>
        WEIGHT_UNITS[(WEIGHT_UNITS.indexOf(current) + 1) % WEIGHT_UNITS.length],
      ),
    cycleMetric: () =>
      setMetric((current) =>
        MEASUREMENT_METRICS[(MEASUREMENT_METRICS.indexOf(current) + 1) % MEASUREMENT_METRICS.length],
      ),
    tare,
    addCurrent,
    undo,
    finishMeal,
    toggleFavorite,
    toggleVisibleNutrient,
    selectDate: setSelectedDateKey,
    updateGoal,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
