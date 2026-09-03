export type MeasurementMetric = 'calories' | 'protein' | 'fat' | 'carbs' | 'sodium';
export type TrendMetric = MeasurementMetric;
export type NutritionMetric = MeasurementMetric | 'cholesterol';

export type MetricDefinition = {
  label: string;
  unit: 'kcal' | 'g' | 'mg';
  totalLabel: string;
  accent: string;
  soft: string;
  palette: readonly string[];
};

const caloriePalette = [
  '#FFB000', '#FFC43D', '#FFD35C', '#FFA826', '#FFCC70',
  '#FFB84D', '#FFE08A', '#F6A800', '#FFD978', '#FFBF5C',
  '#F7C948', '#FFE59E', '#F5B82E', '#FFD064', '#FFAA3D',
] as const;

const proteinPalette = [
  '#4F8EF7', '#67A1FF', '#79B1FF', '#5798E9', '#8FC2FF',
  '#6E9FE5', '#A3CEFF', '#3F83DE', '#76AAEC', '#92B9F2',
  '#5E91D6', '#B1D5FF', '#6FA8F7', '#87B7F1', '#4C95F0',
] as const;

const fatPalette = [
  '#FF746D', '#FF8B80', '#FF9B8F', '#F36F70', '#FFADA3',
  '#F5827B', '#FFC0B9', '#EE6466', '#FF948B', '#F7A59C',
  '#F47B73', '#FFD0CB', '#FF867C', '#F39690', '#FF6F67',
] as const;

const carbPalette = [
  '#45C5AF', '#62D4BF', '#77DFCC', '#4CB9AD', '#91E7D6',
  '#58C9BA', '#A9EEE0', '#36AE9D', '#6BCBBE', '#83D9CC',
  '#50BFA9', '#B9F2E7', '#60D0B8', '#79D8C5', '#42B9A4',
] as const;

const sodiumPalette = [
  '#8B6BEF', '#9B7CF5', '#AA8CF9', '#7D67DF', '#B9A4FA',
  '#9278E6', '#C8B8FC', '#7258D4', '#A18DEB', '#B09CEB',
  '#866AE2', '#D6CAFD', '#9476ED', '#A98FEF', '#7F62E8',
] as const;

const cholesterolPalette = [
  '#CE63D4', '#DC79DF', '#E38BE5', '#C45CC9', '#EBA6EB',
  '#D16BD0', '#F0B9F0', '#B94DBF', '#D987D8', '#E29AE0',
  '#C85FC8', '#F5CAF3', '#D474D8', '#DF8CDE', '#C156C4',
] as const;

export const METRIC_DEFINITIONS: Record<NutritionMetric, MetricDefinition> = {
  calories: {
    label: '热量', unit: 'kcal', totalLabel: '本餐总卡路里',
    accent: '#FF9F0A', soft: '#FFE390', palette: caloriePalette,
  },
  protein: {
    label: '蛋白质', unit: 'g', totalLabel: '本餐总蛋白质',
    accent: '#4F8EF7', soft: '#DDEBFF', palette: proteinPalette,
  },
  fat: {
    label: '脂肪', unit: 'g', totalLabel: '本餐总脂肪',
    accent: '#FF746D', soft: '#FFE1DE', palette: fatPalette,
  },
  carbs: {
    label: '碳水化合物', unit: 'g', totalLabel: '本餐总碳水化合物',
    accent: '#45BCA8', soft: '#D9F7F0', palette: carbPalette,
  },
  sodium: {
    label: '钠', unit: 'mg', totalLabel: '本餐总钠',
    accent: '#8B6BEF', soft: '#E9E0FF', palette: sodiumPalette,
  },
  cholesterol: {
    label: '胆固醇', unit: 'mg', totalLabel: '本餐总胆固醇',
    accent: '#CE63D4', soft: '#F7DDF7', palette: cholesterolPalette,
  },
};

export const MEASUREMENT_METRICS: readonly MeasurementMetric[] = [
  'calories', 'protein', 'fat', 'carbs', 'sodium',
];

export const TREND_METRICS: readonly TrendMetric[] = MEASUREMENT_METRICS;
