import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import {
  NUTRIENT_DISPLAY_META,
  VISIBLE_NUTRIENT_ORDER,
  type VisibleNutrient,
  useAppState,
} from '@/components/app-state';
import { FoodIcon } from '@/components/food-icon';
import { ScreenShell } from '@/components/screen-shell';
import { TopBar, useTopContentInset } from '@/components/top-bar';
import type { Food } from '@/constants/foods';
import { AppColors, AppFonts } from '@/constants/theme';

type MoreItemId = 'devices' | 'favorites' | 'library' | 'nutrition' | 'feedback' | 'faq' | 'about';

type MoreItem = {
  id: MoreItemId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const items: MoreItem[] = [
  { id: 'devices', label: '设备管理', icon: 'scale-outline' },
  { id: 'favorites', label: '食材收藏夹', icon: 'folder-outline' },
  { id: 'library', label: '食材库', icon: 'nutrition-outline' },
  { id: 'nutrition', label: '营养成分设置', icon: 'git-network-outline' },
  { id: 'feedback', label: '意见反馈', icon: 'create-outline' },
  { id: 'faq', label: '常见问题', icon: 'help-buoy-outline' },
];

const nutrientOptions: {
  id: VisibleNutrient;
  label: string;
  description: string;
}[] = VISIBLE_NUTRIENT_ORDER.map((id) => ({
  id,
  label: NUTRIENT_DISPLAY_META[id].label,
  description: `显示每日${NUTRIENT_DISPLAY_META[id].label}摄入`,
}));

function MoreRow({ item, onPress }: { item: MoreItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`打开${item.label}`}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 73,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        opacity: pressed ? 0.52 : 1,
        backgroundColor: pressed ? '#F8F8F8' : AppColors.white,
      })}>
      <View style={{ width: 58, alignItems: 'center' }}>
        <Ionicons name={item.icon} size={31} color={AppColors.orange} />
      </View>
      <View
        style={{
          flex: 1,
          minHeight: 73,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: AppColors.separator,
        }}>
        <Text style={{ flex: 1, fontFamily: AppFonts.regular, fontSize: 19, color: AppColors.text }}>
          {item.label}
        </Text>
        <Ionicons name="chevron-forward" size={22} color="#B5B5BA" style={{ marginRight: 8 }} />
      </View>
    </Pressable>
  );
}

function SheetFrame({
  visible,
  title,
  icon,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' }}>
        <Pressable accessibilityLabel="关闭详情" onPress={onClose} style={{ flex: 1 }} />
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '84%',
            alignSelf: 'center',
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            backgroundColor: AppColors.white,
            paddingTop: 12,
            overflow: 'hidden',
          }}>
          <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: '#D1D1D6', alignSelf: 'center' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 14 }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#FFF4DF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={icon} size={27} color={AppColors.orange} />
            </View>
            <Text style={{ flex: 1, marginLeft: 13, fontFamily: AppFonts.demiBold, fontSize: 24 }}>{title}</Text>
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
              <Ionicons name="close" size={24} />
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 38 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DeviceContent() {
  const { deviceBattery, deviceVersion } = useAppState();
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        accessibilityLabel="通用摄像头营养秤参考设备示意图"
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          borderRadius: 24,
          backgroundColor: '#F0F0F5',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Ionicons name="camera-outline" size={52} color={AppColors.textSecondary} />
          <Ionicons name="scale-outline" size={66} color={AppColors.orange} />
        </View>
        <Text style={{ fontFamily: AppFonts.medium, color: AppColors.textSecondary }}>
          Camera + load-cell reference device
        </Text>
      </View>
      <Text style={{ marginTop: 12, fontFamily: AppFonts.demiBold, fontSize: 25 }}>营养秤参考设备</Text>
      <Text style={{ marginTop: 5, fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
        当前连接设备
      </Text>
      <View style={{ width: '100%', borderRadius: 24, backgroundColor: AppColors.surfaceSoft, padding: 18, gap: 14, marginTop: 20 }}>
        {[
          ['连接状态', '模拟连接'],
          ['当前电量', `${deviceBattery}%`],
          ['当前版本', `v${deviceVersion}`],
        ].map(([label, value]) => (
          <View key={label} style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>{label}</Text>
            <Text selectable style={{ fontFamily: AppFonts.medium }}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FavoriteContent() {
  const { foods, favorites, toggleFavorite } = useAppState();
  const favoriteFoods = foods.filter((food) => favorites.has(food.id));
  if (!favoriteFoods.length) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 44 }}>
        <Ionicons name="star-outline" size={44} color={AppColors.textSecondary} />
        <Text style={{ marginTop: 12, fontFamily: AppFonts.medium, fontSize: 18 }}>还没有收藏食材</Text>
        <Text style={{ marginTop: 6, fontFamily: AppFonts.regular, color: AppColors.textSecondary }}>
          在测量页识别食材后点击星标即可收藏
        </Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {favoriteFoods.map((food) => (
        <View
          key={food.id}
          style={{
            minHeight: 72,
            borderRadius: 22,
            backgroundColor: AppColors.surfaceSoft,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <FoodIcon food={food} size={46} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontFamily: AppFonts.medium, fontSize: 17 }}>{food.name}</Text>
            <Text style={{ fontFamily: AppFonts.regular, fontSize: 12, color: AppColors.textSecondary }}>
              每100g · {food.nutrition.calories} kcal · 蛋白质 {food.nutrition.protein}g
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`取消收藏${food.name}`}
            onPress={() => toggleFavorite(food.id)}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.55 : 1,
            })}>
            <Ionicons name="star" size={25} color={AppColors.yellow} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function FoodNutritionCard({ food }: { food: Food }) {
  const nutrition = food.nutrition;
  return (
    <View style={{ borderRadius: 24, backgroundColor: AppColors.surfaceSoft, padding: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FoodIcon food={food} size={48} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontFamily: AppFonts.demiBold, fontSize: 18 }}>{food.name}</Text>
          <Text style={{ fontFamily: AppFonts.regular, fontSize: 12, color: AppColors.textSecondary }}>
            {food.category} · 以下均为每 100 g
          </Text>
        </View>
        <Text style={{ fontFamily: AppFonts.medium, fontSize: 20, color: AppColors.orange }}>
          {nutrition.calories}
          <Text style={{ fontFamily: AppFonts.regular, fontSize: 11 }}> kcal</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, marginTop: 14 }}>
        {[
          ['蛋白质', `${nutrition.protein}g`],
          ['脂肪', `${nutrition.fat}g`],
          ['碳水', `${nutrition.carbs}g`],
          ['钠', `${nutrition.sodium}mg`],
          ['胆固醇', `${nutrition.cholesterol}mg`],
          ['膳食纤维', `${nutrition.fiber}g`],
        ].map(([label, value]) => (
          <View key={label} style={{ width: '33.333%', alignItems: 'center' }}>
            <Text selectable style={{ fontFamily: AppFonts.medium, fontSize: 14 }}>{value}</Text>
            <Text style={{ fontFamily: AppFonts.regular, fontSize: 10, color: AppColors.textSecondary }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LibraryContent() {
  const { foods } = useAppState();
  return (
    <View>
      <Text style={{ fontFamily: AppFonts.regular, fontSize: 14, lineHeight: 21, color: AppColors.textSecondary }}>
        当前数据库共 {foods.length} 种食材。这里展示营养资料，不模拟称重；数值为原型参考，正式上线前需要复核来源。
      </Text>
      <View style={{ gap: 12, marginTop: 16 }}>
        {foods.map((food) => <FoodNutritionCard key={food.id} food={food} />)}
      </View>
    </View>
  );
}

function NutritionSettingsContent() {
  const { visibleNutrients, toggleVisibleNutrient } = useAppState();
  return (
    <View>
      <Text style={{ fontFamily: AppFonts.regular, color: AppColors.textSecondary, lineHeight: 21 }}>
        打开的项目会显示在趋势页每日营养统计表；关闭只隐藏显示，不会删除历史数据。
      </Text>
      <View style={{ marginTop: 16 }}>
        {nutrientOptions.map((item, index) => (
          <View
            key={item.id}
            style={{
              minHeight: 72,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: index === nutrientOptions.length - 1 ? 0 : 1,
              borderBottomColor: AppColors.separator,
            }}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              <Text style={{ fontFamily: AppFonts.medium, fontSize: 17 }}>{item.label}</Text>
              <Text style={{ marginTop: 3, fontFamily: AppFonts.regular, fontSize: 12, color: AppColors.textSecondary }}>
                {item.description}
              </Text>
            </View>
            <View
              style={{
                width: 64,
                alignSelf: 'stretch',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 4,
              }}>
              <Switch
                accessibilityLabel={`在趋势页显示${item.label}`}
                value={visibleNutrients.has(item.id)}
                onValueChange={() => toggleVisibleNutrient(item.id)}
                trackColor={{ false: '#D1D1D6', true: AppColors.green }}
                thumbColor={AppColors.white}
                ios_backgroundColor="#D1D1D6"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SimpleContent({ id }: { id: 'feedback' | 'faq' | 'about' }) {
  const content = {
    feedback: ['当前演示版不上传个人数据', '建议记录出现问题的页面和操作步骤', '后续可增加匿名诊断信息'],
    faq: ['为什么显示模拟？因为尚未接入真实硬件', '为什么数值有差异？食材和烹饪状态会影响营养', '如何查看收藏？进入“更多 → 食材收藏夹”'],
    about: ['Camera Nutrition Scale Reference v0.1', 'Expo + React Native + TypeScript', '当前营养数据仅供原型演示'],
  }[id];
  return (
    <View style={{ borderRadius: 24, backgroundColor: AppColors.surfaceSoft, padding: 18, gap: 14 }}>
      {content.map((text, index) => (
        <View key={text} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: index % 2 ? AppColors.green : AppColors.orange, marginTop: 7, marginRight: 10 }} />
          <Text style={{ flex: 1, fontFamily: AppFonts.regular, fontSize: 15, lineHeight: 21 }}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

export default function MoreScreen() {
  const topContentInset = useTopContentInset();
  const [selected, setSelected] = useState<MoreItemId | null>(null);
  const selectedItem = [...items, { id: 'about' as const, label: '关于', icon: 'information-circle-outline' as const }]
    .find((item) => item.id === selected);

  return (
    <ScreenShell>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topContentInset + 14, paddingBottom: 30 }}>
          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: AppFonts.regular, fontSize: 30, color: AppColors.text }}>更多</Text>
            <View style={{ marginTop: 28 }}>
              {items.map((item) => (
                <MoreRow key={item.id} item={item} onPress={() => setSelected(item.id)} />
              ))}
            </View>
          </View>
        </ScrollView>
        <TopBar onMore={() => setSelected('about')} />
        <SheetFrame
          visible={!!selectedItem}
          title={selectedItem?.label ?? ''}
          icon={selectedItem?.icon ?? 'information-circle-outline'}
          onClose={() => setSelected(null)}>
          {selected === 'devices' && <DeviceContent />}
          {selected === 'favorites' && <FavoriteContent />}
          {selected === 'library' && <LibraryContent />}
          {selected === 'nutrition' && <NutritionSettingsContent />}
          {(selected === 'feedback' || selected === 'faq' || selected === 'about') && <SimpleContent id={selected} />}
        </SheetFrame>
      </View>
    </ScreenShell>
  );
}
