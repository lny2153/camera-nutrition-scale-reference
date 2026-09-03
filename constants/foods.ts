import type { ImageSourcePropType } from 'react-native';

export type FoodCategory = '蔬菜与配料' | '水果' | '蛋白质与主食' | '液体与乳品';

export type NutritionPer100g = {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  cholesterol: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  betaCarotene: number;
  niacin: number;
  retinolEquivalent: number;
  vitaminA: number;
  vitaminB1: number;
  vitaminB2: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  iron: number;
  zinc: number;
  copper: number;
  manganese: number;
  phosphorus: number;
  selenium: number;
};

type Micronutrients = Pick<
  NutritionPer100g,
  | 'betaCarotene'
  | 'niacin'
  | 'retinolEquivalent'
  | 'vitaminA'
  | 'vitaminB1'
  | 'vitaminB2'
  | 'vitaminC'
  | 'vitaminD'
  | 'vitaminE'
  | 'potassium'
  | 'calcium'
  | 'magnesium'
  | 'iron'
  | 'zinc'
  | 'copper'
  | 'manganese'
  | 'phosphorus'
  | 'selenium'
>;

const ZERO_MICRONUTRIENTS: Micronutrients = {
  betaCarotene: 0,
  niacin: 0,
  retinolEquivalent: 0,
  vitaminA: 0,
  vitaminB1: 0,
  vitaminB2: 0,
  vitaminC: 0,
  vitaminD: 0,
  vitaminE: 0,
  potassium: 0,
  calcium: 0,
  magnesium: 0,
  iron: 0,
  zinc: 0,
  copper: 0,
  manganese: 0,
  phosphorus: 0,
  selenium: 0,
};

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  densityGPerMl?: number;
  emoji?: string;
  image?: ImageSourcePropType;
  nutrition: NutritionPer100g;
};

const n = (
  calories: number,
  carbs: number,
  fat: number,
  protein: number,
  sodium: number,
  fiber: number,
  sugar: number,
  saturatedFat: number,
  cholesterol = 0,
): NutritionPer100g => ({
  calories,
  carbs,
  fat,
  protein,
  sodium,
  cholesterol,
  fiber,
  sugar,
  saturatedFat,
  ...ZERO_MICRONUTRIENTS,
});

/**
 * Prototype reference values per 100 g of edible food.
 * Salad produce uses its common raw serving state; proteins and grains use a common cooked state.
 * Values are rounded for a demo and must be replaced by product-reviewed records before release.
 * Source basis: USDA FoodData Central Foundation / SR Legacy foods.
 */
const BASE_FOODS: Food[] = [
  { id: 'tomato', name: '番茄', category: '蔬菜与配料', emoji: '🍅', nutrition: n(18, 3.9, 0.2, 0.9, 5, 1.2, 2.6, 0.03) },
  { id: 'lettuce', name: '生菜', category: '蔬菜与配料', emoji: '🥬', nutrition: n(15, 2.9, 0.2, 1.4, 28, 1.3, 0.8, 0.03) },
  { id: 'spinach', name: '菠菜', category: '蔬菜与配料', emoji: '🌱', nutrition: n(23, 3.6, 0.4, 2.9, 79, 2.2, 0.4, 0.06) },
  { id: 'cucumber', name: '黄瓜', category: '蔬菜与配料', emoji: '🥒', nutrition: n(15, 3.6, 0.1, 0.7, 2, 0.5, 1.7, 0.04) },
  { id: 'carrot', name: '胡萝卜', category: '蔬菜与配料', emoji: '🥕', nutrition: n(41, 9.6, 0.2, 0.9, 69, 2.8, 4.7, 0.04) },
  { id: 'broccoli', name: '西兰花', category: '蔬菜与配料', emoji: '🥦', nutrition: n(35, 7.2, 0.4, 2.4, 41, 3.3, 1.4, 0.08) },
  { id: 'pepper', name: '彩椒', category: '蔬菜与配料', emoji: '🫑', nutrition: n(31, 6, 0.3, 1, 4, 2.1, 4.2, 0.03) },
  { id: 'corn', name: '玉米', category: '蔬菜与配料', emoji: '🌽', nutrition: n(96, 21, 1.5, 3.4, 1, 2.4, 4.5, 0.2) },
  { id: 'potato', name: '土豆', category: '蔬菜与配料', emoji: '🥔', nutrition: n(87, 20.1, 0.1, 1.9, 4, 1.8, 0.9, 0.03) },
  { id: 'sweet-potato', name: '红薯', category: '蔬菜与配料', emoji: '🍠', nutrition: n(90, 20.7, 0.2, 2, 36, 3.3, 6.5, 0.04) },
  { id: 'mushroom', name: '蘑菇', category: '蔬菜与配料', emoji: '🍄', nutrition: n(22, 3.3, 0.3, 3.1, 5, 1, 2, 0.05) },
  { id: 'chickpea', name: '鹰嘴豆（熟）', category: '蔬菜与配料', emoji: '🫘', nutrition: n(164, 27.4, 2.6, 8.9, 7, 7.6, 4.8, 0.27) },
  { id: 'apple', name: '苹果', category: '水果', emoji: '🍎', nutrition: n(52, 13.8, 0.2, 0.3, 1, 2.4, 10.4, 0.03) },
  { id: 'avocado', name: '牛油果', category: '水果', emoji: '🥑', nutrition: n(160, 8.5, 14.7, 2, 7, 6.7, 0.7, 2.13) },
  { id: 'strawberry', name: '草莓', category: '水果', emoji: '🍓', nutrition: n(32, 7.7, 0.3, 0.7, 1, 2, 4.9, 0.02) },
  { id: 'blueberry', name: '蓝莓', category: '水果', emoji: '🫐', nutrition: n(57, 14.5, 0.3, 0.7, 1, 2.4, 10, 0.03) },
  { id: 'orange', name: '橙子', category: '水果', emoji: '🍊', nutrition: n(47, 11.8, 0.1, 0.9, 0, 2.4, 9.4, 0.02) },
  { id: 'kiwi', name: '奇异果', category: '水果', emoji: '🥝', nutrition: n(61, 14.7, 0.5, 1.1, 3, 3, 9, 0.03) },
  { id: 'mango', name: '芒果', category: '水果', emoji: '🥭', nutrition: n(60, 15, 0.4, 0.8, 1, 1.6, 13.7, 0.09) },
  { id: 'pineapple', name: '菠萝', category: '水果', emoji: '🍍', nutrition: n(50, 13.1, 0.1, 0.5, 1, 1.4, 9.9, 0.01) },
  { id: 'chicken', name: '鸡胸肉（熟）', category: '蛋白质与主食', emoji: '🍗', nutrition: n(165, 0, 3.6, 31, 74, 0, 0, 1.01, 85) },
  { id: 'shrimp', name: '虾仁（熟）', category: '蛋白质与主食', emoji: '🍤', nutrition: n(99, 0.2, 0.3, 24, 111, 0, 0, 0.06, 189) },
  { id: 'salmon', name: '三文鱼（熟）', category: '蛋白质与主食', emoji: '🐟', nutrition: n(206, 0, 12.4, 22.1, 61, 0, 0, 3.1, 63) },
  { id: 'tuna', name: '金枪鱼（熟）', category: '蛋白质与主食', emoji: '🐠', nutrition: n(132, 0, 1.3, 28.2, 47, 0, 0, 0.36, 60) },
  { id: 'egg', name: '鸡蛋（熟）', category: '蛋白质与主食', emoji: '🥚', nutrition: n(155, 1.1, 10.6, 12.6, 124, 0, 1.1, 3.27, 373) },
  { id: 'tofu', name: '豆腐', category: '蛋白质与主食', emoji: '◻️', nutrition: n(83, 1.2, 5.3, 10, 7, 1, 0.2, 0.73) },
  { id: 'beef', name: '牛肉（熟）', category: '蛋白质与主食', emoji: '🥩', nutrition: n(250, 0, 15, 26, 72, 0, 0, 5.9, 90) },
  { id: 'turkey', name: '火鸡肉（熟）', category: '蛋白质与主食', emoji: '🦃', nutrition: n(135, 0, 3.3, 29, 104, 0, 0, 1, 109) },
  { id: 'cheese', name: '奶酪', category: '蛋白质与主食', emoji: '🧀', nutrition: n(403, 1.3, 33.1, 24.9, 621, 0, 0.5, 21.1, 105) },
  { id: 'quinoa', name: '藜麦（熟）', category: '蛋白质与主食', emoji: '🌾', nutrition: n(120, 21.3, 1.9, 4.4, 7, 2.8, 0.9, 0.23) },
  { id: 'milk', name: '牛奶', category: '液体与乳品', densityGPerMl: 1.03, emoji: '🥛', nutrition: n(61, 4.8, 3.3, 3.2, 43, 0, 5.1, 1.87, 10) },
  { id: 'yogurt', name: '酸奶', category: '液体与乳品', densityGPerMl: 1.03, emoji: '🥣', nutrition: n(61, 4.7, 3.3, 3.5, 46, 0, 4.7, 2.1, 13) },
];

type MicroProfileId =
  | 'leafy'
  | 'vegetable'
  | 'root'
  | 'fruit'
  | 'avocado'
  | 'legume'
  | 'poultry'
  | 'fish'
  | 'egg'
  | 'dairy'
  | 'grain'
  | 'beef'
  | 'tofu';

const MICRO_PROFILES: Record<MicroProfileId, Micronutrients> = {
  leafy: { betaCarotene: 4200, niacin: 0.7, retinolEquivalent: 350, vitaminA: 350, vitaminB1: 0.08, vitaminB2: 0.14, vitaminC: 18, vitaminD: 0, vitaminE: 2, potassium: 450, calcium: 95, magnesium: 55, iron: 2.4, zinc: 0.5, copper: 0.13, manganese: 0.9, phosphorus: 50, selenium: 1 },
  vegetable: { betaCarotene: 900, niacin: 0.8, retinolEquivalent: 75, vitaminA: 75, vitaminB1: 0.06, vitaminB2: 0.08, vitaminC: 35, vitaminD: 0, vitaminE: 0.8, potassium: 300, calcium: 35, magnesium: 25, iron: 0.8, zinc: 0.4, copper: 0.08, manganese: 0.2, phosphorus: 45, selenium: 0.6 },
  root: { betaCarotene: 6200, niacin: 0.9, retinolEquivalent: 520, vitaminA: 520, vitaminB1: 0.08, vitaminB2: 0.06, vitaminC: 20, vitaminD: 0, vitaminE: 0.4, potassium: 350, calcium: 35, magnesium: 28, iron: 0.8, zinc: 0.3, copper: 0.08, manganese: 0.4, phosphorus: 45, selenium: 0.7 },
  fruit: { betaCarotene: 250, niacin: 0.6, retinolEquivalent: 20, vitaminA: 20, vitaminB1: 0.05, vitaminB2: 0.05, vitaminC: 35, vitaminD: 0, vitaminE: 0.8, potassium: 250, calcium: 25, magnesium: 18, iron: 0.4, zinc: 0.2, copper: 0.07, manganese: 0.15, phosphorus: 25, selenium: 0.6 },
  avocado: { betaCarotene: 62, niacin: 1.7, retinolEquivalent: 7, vitaminA: 7, vitaminB1: 0.07, vitaminB2: 0.13, vitaminC: 10, vitaminD: 0, vitaminE: 2.1, potassium: 485, calcium: 12, magnesium: 29, iron: 0.6, zinc: 0.6, copper: 0.19, manganese: 0.14, phosphorus: 52, selenium: 0.4 },
  legume: { betaCarotene: 25, niacin: 0.5, retinolEquivalent: 2, vitaminA: 2, vitaminB1: 0.12, vitaminB2: 0.06, vitaminC: 1, vitaminD: 0, vitaminE: 0.35, potassium: 291, calcium: 49, magnesium: 48, iron: 2.9, zinc: 1.5, copper: 0.35, manganese: 1, phosphorus: 168, selenium: 3.7 },
  poultry: { betaCarotene: 0, niacin: 13.7, retinolEquivalent: 5, vitaminA: 5, vitaminB1: 0.07, vitaminB2: 0.12, vitaminC: 0, vitaminD: 0, vitaminE: 0.27, potassium: 256, calcium: 15, magnesium: 29, iron: 1, zinc: 1, copper: 0.04, manganese: 0.02, phosphorus: 220, selenium: 27.6 },
  fish: { betaCarotene: 0, niacin: 8, retinolEquivalent: 4, vitaminA: 4, vitaminB1: 0.1, vitaminB2: 0.15, vitaminC: 0, vitaminD: 8, vitaminE: 1.5, potassium: 350, calcium: 20, magnesium: 35, iron: 1, zinc: 0.7, copper: 0.1, manganese: 0.02, phosphorus: 250, selenium: 35 },
  egg: { betaCarotene: 0, niacin: 0.1, retinolEquivalent: 160, vitaminA: 160, vitaminB1: 0.07, vitaminB2: 0.5, vitaminC: 0, vitaminD: 2, vitaminE: 1, potassium: 126, calcium: 50, magnesium: 10, iron: 1.2, zinc: 1.1, copper: 0.07, manganese: 0.03, phosphorus: 172, selenium: 30 },
  dairy: { betaCarotene: 50, niacin: 0.1, retinolEquivalent: 265, vitaminA: 265, vitaminB1: 0.03, vitaminB2: 0.38, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.7, potassium: 98, calcium: 721, magnesium: 28, iron: 0.7, zinc: 3.1, copper: 0.03, manganese: 0.01, phosphorus: 512, selenium: 14.5 },
  grain: { betaCarotene: 5, niacin: 1.5, retinolEquivalent: 1, vitaminA: 1, vitaminB1: 0.1, vitaminB2: 0.1, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, potassium: 170, calcium: 17, magnesium: 64, iron: 1.5, zinc: 1.1, copper: 0.2, manganese: 0.6, phosphorus: 152, selenium: 2.8 },
  beef: { betaCarotene: 0, niacin: 5.8, retinolEquivalent: 3, vitaminA: 3, vitaminB1: 0.06, vitaminB2: 0.2, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, potassium: 318, calcium: 18, magnesium: 21, iron: 2.6, zinc: 6, copper: 0.08, manganese: 0.01, phosphorus: 198, selenium: 26 },
  tofu: { betaCarotene: 0, niacin: 0.4, retinolEquivalent: 0, vitaminA: 0, vitaminB1: 0.08, vitaminB2: 0.05, vitaminC: 0, vitaminD: 0, vitaminE: 0.01, potassium: 121, calcium: 350, magnesium: 30, iron: 5.4, zinc: 0.8, copper: 0.2, manganese: 0.6, phosphorus: 97, selenium: 17.4 },
};

const PROFILE_BY_FOOD: Record<string, MicroProfileId> = {
  tomato: 'vegetable', lettuce: 'leafy', spinach: 'leafy', cucumber: 'vegetable', carrot: 'root', broccoli: 'vegetable', pepper: 'vegetable', corn: 'grain', potato: 'root', 'sweet-potato': 'root', mushroom: 'vegetable', chickpea: 'legume',
  apple: 'fruit', avocado: 'avocado', strawberry: 'fruit', blueberry: 'fruit', orange: 'fruit', kiwi: 'fruit', mango: 'fruit', pineapple: 'fruit',
  chicken: 'poultry', shrimp: 'fish', salmon: 'fish', tuna: 'fish', egg: 'egg', tofu: 'tofu', beef: 'beef', turkey: 'poultry', cheese: 'dairy', quinoa: 'grain', milk: 'dairy', yogurt: 'dairy',
};

export const FOODS: Food[] = BASE_FOODS.map((food) => ({
  ...food,
  nutrition: {
    ...food.nutrition,
    ...MICRO_PROFILES[PROFILE_BY_FOOD[food.id]],
  },
}));

export const getFood = (id: string) => FOODS.find((food) => food.id === id) ?? FOODS[0];

export const scaleNutrition = (food: Food, grams: number) => {
  const factor = Math.max(0, grams) / 100;
  return Object.fromEntries(
    Object.entries(food.nutrition).map(([key, value]) => [key, value * factor]),
  ) as NutritionPer100g;
};
