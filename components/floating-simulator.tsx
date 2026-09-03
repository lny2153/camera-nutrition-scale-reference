import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useAppState } from '@/components/app-state';
import { FoodIcon } from '@/components/food-icon';
import type { Food } from '@/constants/foods';
import { AppColors, AppFonts } from '@/constants/theme';

function FoodChoice({ food, selected, onPress }: { food: Food; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`选择${food.name}`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 82,
        minHeight: 82,
        borderRadius: 22,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? AppColors.control : AppColors.separator,
        backgroundColor: selected ? '#FAFAFA' : AppColors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        paddingHorizontal: 6,
        opacity: pressed ? 0.6 : 1,
      })}>
      <FoodIcon food={food} size={42} />
      <Text
        numberOfLines={1}
        style={{ marginTop: 4, fontFamily: AppFonts.regular, fontSize: 12, color: AppColors.text }}>
        {food.name.replace('（熟）', '')}
      </Text>
    </Pressable>
  );
}

export function FloatingSimulator() {
  const {
    foods,
    favorites,
    selectedFood,
    simulatorOpen,
    setSimulatorOpen,
    scanFood,
  } = useAppState();
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [simFood, setSimFood] = useState(selectedFood);
  const [grams, setGrams] = useState('');
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const minX = Math.min(0, -(Math.min(width, 520) - 86));
  const minY = Math.min(0, -(height - 230));

  const drag = Gesture.Pan()
    .minDistance(8)
    .onBegin(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = Math.max(minX, Math.min(0, startX.value + event.translationX));
      y.value = Math.max(minY, Math.min(0, startY.value + event.translationY));
    })
    .onEnd(() => {
      x.value = withSpring(x.value < minX / 2 ? minX : 0, { damping: 18, stiffness: 190 });
      y.value = withSpring(y.value, { damping: 18, stiffness: 190 });
    });

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? foods.filter((food) => food.name.toLowerCase().includes(normalized)) : foods;
  }, [foods, query]);

  const favoriteFoods = useMemo(
    () => foods.filter((food) => favorites.has(food.id)),
    [favorites, foods]
  );

  const simulatedGrams = Math.min(9999, Math.max(0, Number(grams) || 0));
  const previewCalories = Math.round((simFood.nutrition.calories * simulatedGrams) / 100);

  return (
    <>
      <GestureDetector gesture={drag}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 18,
              bottom: 108,
              width: 62,
              height: 62,
              borderRadius: 31,
              backgroundColor: AppColors.control,
              borderWidth: 4,
              borderColor: AppColors.white,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            },
            ballStyle,
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="打开模拟秤"
            onPress={() => {
              setSimFood(selectedFood);
              setGrams('');
              setSimulatorOpen(true);
            }}
            style={({ pressed }) => ({
              width: '100%',
              height: '100%',
              borderRadius: 31,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.65 : 1,
            })}>
            <Ionicons name="scale-outline" size={29} color="white" />
            <View
              style={{
                position: 'absolute',
                right: -2,
                top: -2,
                width: 17,
                height: 17,
                borderRadius: 9,
                backgroundColor: AppColors.green,
                borderWidth: 3,
                borderColor: AppColors.white,
              }}
            />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={simulatorOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setSimulatorOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(130)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.28)' }}>
            <Pressable
              accessibilityLabel="关闭模拟器"
              onPress={() => setSimulatorOpen(false)}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            entering={FadeIn.duration(210)}
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '88%',
              alignSelf: 'center',
              backgroundColor: AppColors.white,
              borderTopLeftRadius: 34,
              borderTopRightRadius: 34,
              paddingTop: 12,
              paddingBottom: 28,
            }}>
            <View
              style={{
                width: 42,
                height: 5,
                borderRadius: 3,
                backgroundColor: '#D1D1D6',
                alignSelf: 'center',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingTop: 14,
                paddingBottom: 10,
              }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 25, color: AppColors.text }}>
                  模拟营养秤
                </Text>
                <Text
                  style={{
                    marginTop: 3,
                    fontFamily: AppFonts.regular,
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  }}>
                  选择食材和克重，模拟摄像头识别与秤面称重
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭"
                onPress={() => setSimulatorOpen(false)}
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: AppColors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                })}>
                <Ionicons name="close" size={24} color={AppColors.text} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={{ paddingHorizontal: 24 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: AppColors.surface,
                    borderRadius: 18,
                    paddingHorizontal: 14,
                    height: 46,
                  }}>
                  <Ionicons name="search" size={20} color={AppColors.textSecondary} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={`搜索 ${foods.length} 种食材`}
                    placeholderTextColor={AppColors.textSecondary}
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      fontFamily: AppFonts.regular,
                      fontSize: 16,
                      color: AppColors.text,
                    }}
                  />
                </View>
              </View>

              {favoriteFoods.length > 0 && query.length === 0 ? (
                <>
                  <Text
                    style={{
                      paddingHorizontal: 24,
                      paddingTop: 16,
                      fontFamily: AppFonts.medium,
                      fontSize: 15,
                      color: AppColors.text,
                    }}>
                    我的收藏
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
                    {favoriteFoods.map((food) => (
                      <FoodChoice
                        key={`favorite-${food.id}`}
                        food={food}
                        selected={simFood.id === food.id}
                        onPress={() => {
                          setSimFood(food);
                          setGrams('');
                        }}
                      />
                    ))}
                  </ScrollView>
                  <Text
                    style={{
                      paddingHorizontal: 24,
                      fontFamily: AppFonts.medium,
                      fontSize: 15,
                      color: AppColors.text,
                    }}>
                    全部食材
                  </Text>
                </>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 }}>
                {filteredFoods.map((food) => (
                  <FoodChoice
                    key={food.id}
                    food={food}
                    selected={simFood.id === food.id}
                    onPress={() => {
                      setSimFood(food);
                      setGrams('');
                    }}
                  />
                ))}
              </ScrollView>

              <View style={{ paddingHorizontal: 24 }}>
                <View
                  style={{
                    minHeight: 112,
                    borderRadius: 28,
                    backgroundColor: AppColors.greenSoft,
                    padding: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FoodIcon food={simFood} size={70} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ fontFamily: AppFonts.medium, fontSize: 18 }}>{simFood.name}</Text>
                    <TextInput
                      value={grams}
                      onChangeText={(value) => setGrams(value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="输入克重"
                      placeholderTextColor={AppColors.textSecondary}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      accessibilityLabel="模拟重量，单位克"
                      style={{
                        marginTop: 4,
                        fontFamily: AppFonts.demiBold,
                        fontSize: 38,
                        color: AppColors.text,
                        padding: 0,
                      }}
                    />
                    <Text style={{ fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>克</Text>
                    {simulatedGrams === 0 ? (
                      <Text
                        style={{
                          marginTop: 3,
                          fontFamily: AppFonts.regular,
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        }}>
                        请输入食材重量
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 28 }}>{previewCalories}</Text>
                    <Text style={{ fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
                      kcal
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="开始模拟识别与称重"
                  disabled={simulatedGrams <= 0}
                  onPress={() => scanFood(simFood, simulatedGrams)}
                  style={({ pressed }) => ({
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: simulatedGrams > 0 ? AppColors.control : '#C7C7CC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 16,
                    opacity: pressed ? 0.7 : 1,
                  })}>
                  <Text style={{ color: 'white', fontFamily: AppFonts.medium, fontSize: 18 }}>
                    模拟识别与称重
                  </Text>
                </Pressable>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                    fontFamily: AppFonts.regular,
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  }}>
                  原型参考数据：USDA FoodData Central；正式产品上线前需复核
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
