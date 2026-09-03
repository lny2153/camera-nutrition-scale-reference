import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { type MealRecord, sumEntries } from '@/components/app-state';
import { METRIC_DEFINITIONS, type TrendMetric } from '@/constants/nutrition';
import { AppFonts } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function RingSegment({
  length,
  offset,
  circumference,
  color,
  radius,
  center,
  strokeWidth,
}: {
  length: number;
  offset: number;
  circumference: number;
  color: string;
  radius: number;
  center: number;
  strokeWidth: number;
}) {
  const animatedLength = useSharedValue(0);
  const animatedOffset = useSharedValue(0);

  useEffect(() => {
    animatedLength.value = withTiming(length, {
      duration: 420,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
    animatedOffset.value = withTiming(offset, {
      duration: 420,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
  }, [animatedLength, animatedOffset, length, offset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${Math.max(0, animatedLength.value)} ${circumference}`,
    strokeDashoffset: -animatedOffset.value,
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      transform={`rotate(-90 ${center} ${center})`}
    />
  );
}

export function SegmentedProgressRing({
  meals,
  metric,
  goal,
}: {
  meals: MealRecord[];
  metric: TrendMetric;
  goal: number;
}) {
  const size = 230;
  const strokeWidth = 38;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const definition = METRIC_DEFINITIONS[metric];
  const mealValues = meals.map((meal) => sumEntries(meal.entries)[metric]);
  const total = mealValues.reduce((sum, value) => sum + value, 0);
  const rawProgress = goal > 0 ? total / goal : 0;
  const visibleProgress = Math.min(1, rawProgress);
  const visibleLength = circumference * visibleProgress;
  const gap = meals.length > 1 ? 7 : 0;
  let cursor = 0;

  const segments = mealValues.map((value, index) => {
    const fraction = total > 0 ? value / total : 0;
    const rawLength = visibleLength * fraction;
    const length = Math.max(0, rawLength - gap);
    const segment = {
      id: meals[index].id,
      length,
      offset: cursor + gap / 2,
      color: definition.palette[index % definition.palette.length],
    };
    cursor += rawLength;
    return segment;
  });

  return (
    <View
      accessibilityLabel={`${definition.label}目标完成度 ${Math.round(rawProgress * 100)}%`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="#ECECEE" strokeWidth={strokeWidth} />
        {segments.map((segment) => (
          <RingSegment
            key={`${segment.id}-${metric}`}
            {...segment}
            circumference={circumference}
            radius={radius}
            center={center}
            strokeWidth={strokeWidth}
          />
        ))}
      </Svg>
      <Text
        selectable
        style={{
          fontFamily: AppFonts.medium,
          fontSize: 42,
          lineHeight: 48,
          fontVariant: ['tabular-nums'],
        }}>
        {Math.round(rawProgress * 100)}%
      </Text>
      <Text style={{ fontFamily: AppFonts.regular, fontSize: 14, color: '#8E8E93' }}>
        {rawProgress > 1 ? '已超出目标' : '已完成'}
      </Text>
    </View>
  );
}
