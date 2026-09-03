import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { FoodIcon } from '@/components/food-icon';
import type { Food } from '@/constants/foods';
import { AppColors, AppFonts } from '@/constants/theme';

export type FoodPickerMode = 'search' | 'favorites';

export function FoodPickerSheet({
  visible,
  mode,
  foods,
  favorites,
  selectedFoodId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  mode: FoodPickerMode;
  foods: Food[];
  favorites: Set<string>;
  selectedFoodId: string;
  onSelect: (food: Food) => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const cardWidth = (Math.min(width, 520) - 68) / 3;
  const shownFoods = useMemo(() => {
    const source = mode === 'favorites' ? foods.filter((food) => favorites.has(food.id)) : foods;
    const normalized = query.trim().toLowerCase();
    return normalized
      ? source.filter((food) => food.name.toLowerCase().includes(normalized))
      : source;
  }, [favorites, foods, mode, query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <Pressable accessibilityLabel="关闭食材选择" onPress={onClose} style={{ flex: 1 }} />
        </View>
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '82%',
            alignSelf: 'center',
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            backgroundColor: AppColors.white,
            paddingTop: 12,
            overflow: 'hidden',
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
              minHeight: 72,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}>
            <Text style={{ flex: 1, fontFamily: AppFonts.demiBold, fontSize: 25, color: AppColors.text }}>
              {mode === 'search' ? '搜索食材' : '食材收藏夹'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="关闭"
              onPress={onClose}
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

          {mode === 'search' ? (
            <View
              style={{
                height: 48,
                marginHorizontal: 24,
                marginBottom: 14,
                borderRadius: 18,
                backgroundColor: AppColors.surface,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Ionicons name="search" size={21} color={AppColors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={`搜索全部 ${foods.length} 种食材`}
                placeholderTextColor={AppColors.textSecondary}
                returnKeyType="search"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontFamily: AppFonts.regular,
                  fontSize: 16,
                  color: AppColors.text,
                }}
              />
            </View>
          ) : null}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 38,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}>
            {shownFoods.map((food) => {
              const selected = food.id === selectedFoodId;
              return (
                <Pressable
                  key={food.id}
                  accessibilityRole="button"
                  accessibilityLabel={`选择${food.name}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(food)}
                  style={({ pressed }) => ({
                    width: cardWidth,
                    minHeight: 104,
                    borderRadius: 24,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? AppColors.control : AppColors.separator,
                    backgroundColor: selected ? AppColors.surfaceSoft : AppColors.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    opacity: pressed ? 0.62 : 1,
                  })}>
                  <FoodIcon food={food} size={52} />
                  <Text
                    numberOfLines={1}
                    style={{ marginTop: 5, fontFamily: AppFonts.medium, fontSize: 13, color: AppColors.text }}>
                    {food.name.replace('（熟）', '')}
                  </Text>
                </Pressable>
              );
            })}
            {!shownFoods.length ? (
              <View style={{ width: '100%', alignItems: 'center', paddingVertical: 48 }}>
                <Ionicons
                  name={mode === 'favorites' ? 'folder-open-outline' : 'search-outline'}
                  size={42}
                  color={AppColors.textSecondary}
                />
                <Text style={{ marginTop: 12, fontFamily: AppFonts.medium, fontSize: 17 }}>
                  {mode === 'favorites' ? '还没有收藏食材' : '没有找到食材'}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
