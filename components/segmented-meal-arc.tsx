import { useEffect, useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { type MealEntry, sumEntries } from '@/components/app-state';
import { FoodIcon } from '@/components/food-icon';
import { getFood, scaleNutrition } from '@/constants/foods';
import { METRIC_DEFINITIONS, type MeasurementMetric } from '@/constants/nutrition';
import { AppColors, AppFonts } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const ARC_GEOMETRY = {
  width: 430,
  height: 280,
  centerX: 215,
  centerY: 238,
  radius: 168,
  startAngle: 200,
  endAngle: 340,
  strokeWidth: 44,
} as const;

type ArcSegment = {
  entry: MealEntry;
  startAngle: number;
  endAngle: number;
  color: string;
};

export function polarPoint(angle: number, radius = ARC_GEOMETRY.radius) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: ARC_GEOMETRY.centerX + radius * Math.cos(radians),
    y: ARC_GEOMETRY.centerY + radius * Math.sin(radians),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  'worklet';
  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;
  const startX = ARC_GEOMETRY.centerX + ARC_GEOMETRY.radius * Math.cos(startRadians);
  const startY = ARC_GEOMETRY.centerY + ARC_GEOMETRY.radius * Math.sin(startRadians);
  const endX = ARC_GEOMETRY.centerX + ARC_GEOMETRY.radius * Math.cos(endRadians);
  const endY = ARC_GEOMETRY.centerY + ARC_GEOMETRY.radius * Math.sin(endRadians);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${startX} ${startY} A ${ARC_GEOMETRY.radius} ${ARC_GEOMETRY.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

export function calculateMealArcSegments(
  entries: MealEntry[],
  metric: MeasurementMetric,
): ArcSegment[] {
  const positiveEntries = [...entries]
    .reverse()
    .map((entry) => ({
      entry,
      value: scaleNutrition(getFood(entry.foodId), entry.grams)[metric],
    }))
    .filter(({ value }) => value > 0);
  const total = positiveEntries.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];

  const sweep = ARC_GEOMETRY.endAngle - ARC_GEOMETRY.startAngle;
  const positiveCount = positiveEntries.length;
  const visualGap = positiveCount > 1 ? Math.min(15, 48 / positiveCount) : 0;
  let cursor: number = ARC_GEOMETRY.startAngle;

  return positiveEntries.map(({ entry, value }, index) => {
    const rawSpan = sweep * (value / total);
    const boundaryEnd = cursor + rawSpan;
    const startAngle = index === 0 ? ARC_GEOMETRY.startAngle : cursor + visualGap / 2;
    const endAngle =
      index === positiveCount - 1
        ? ARC_GEOMETRY.endAngle
        : Math.max(startAngle + 0.5, boundaryEnd - visualGap / 2);
    cursor += rawSpan;
    const segment: ArcSegment = {
      entry,
      startAngle,
      endAngle,
      color: METRIC_DEFINITIONS[metric].palette[index % METRIC_DEFINITIONS[metric].palette.length],
    };
    return segment;
  });
}

function AnimatedArcSegment({ segment }: { segment: ArcSegment }) {
  const start = useSharedValue<number>(ARC_GEOMETRY.startAngle);
  const end = useSharedValue(ARC_GEOMETRY.startAngle + 0.5);

  useEffect(() => {
    start.value = withTiming(segment.startAngle, {
      duration: 360,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
    end.value = withTiming(segment.endAngle, {
      duration: 420,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
  }, [end, segment.endAngle, segment.startAngle, start]);

  const animatedProps = useAnimatedProps(() => ({
    d: describeArc(start.value, Math.max(start.value + 0.5, end.value)),
  }));

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill="none"
      stroke={segment.color}
      strokeWidth={ARC_GEOMETRY.strokeWidth}
      strokeLinecap="round"
    />
  );
}

function AnimatedFoodMarker({ segment, scale }: { segment: ArcSegment; scale: number }) {
  const firstPoint = polarPoint(ARC_GEOMETRY.startAngle);
  const destination = polarPoint(segment.endAngle);
  const markerSize = Math.max(34, 40 * scale);
  const x = useSharedValue(firstPoint.x * scale);
  const y = useSharedValue(firstPoint.y * scale);

  useEffect(() => {
    x.value = withTiming(destination.x * scale, {
      duration: 430,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
    y.value = withTiming(destination.y * scale, {
      duration: 430,
      easing: Easing.bezier(0.22, 0.75, 0.25, 1),
    });
  }, [destination.x, destination.y, scale, x, y]);

  const markerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - markerSize / 2 },
      { translateY: y.value - markerSize / 2 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
          backgroundColor: AppColors.white,
          alignItems: 'center',
          justifyContent: 'center',
        },
        markerStyle,
      ]}>
      <FoodIcon food={getFood(segment.entry.foodId)} size={Math.max(27, 31 * scale)} />
    </Animated.View>
  );
}

export function SegmentedMealArc({
  entries,
  metric,
}: {
  entries: MealEntry[];
  metric: MeasurementMetric;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const componentWidth = Math.min(ARC_GEOMETRY.width, windowWidth - 48);
  const scale = componentWidth / ARC_GEOMETRY.width;
  const componentHeight = ARC_GEOMETRY.height * scale;
  const definition = METRIC_DEFINITIONS[metric];
  const nutrition = useMemo(() => sumEntries(entries), [entries]);
  const segments = useMemo(() => calculateMealArcSegments(entries, metric), [entries, metric]);
  const value = nutrition[metric];
  const displayValue = metric === 'calories' || metric === 'sodium' ? Math.round(value) : value.toFixed(1);
  const basePath = describeArc(ARC_GEOMETRY.startAngle, ARC_GEOMETRY.endAngle);

  return (
    <View
      accessibilityLabel={`${definition.totalLabel} ${displayValue} ${definition.unit}`}
      style={{ width: '100%', height: componentHeight, alignItems: 'center' }}>
      <View
        style={{
          width: componentWidth,
          height: componentHeight,
          alignSelf: 'center',
        }}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${ARC_GEOMETRY.width} ${ARC_GEOMETRY.height}`}>
          <Path
            d={basePath}
            fill="none"
            stroke="#ECECEE"
            strokeWidth={ARC_GEOMETRY.strokeWidth}
            strokeLinecap="round"
          />
          {segments.map((segment) => (
            <AnimatedArcSegment key={`${segment.entry.id}-${metric}`} segment={segment} />
          ))}
        </Svg>
        {segments.map((segment) => (
          <AnimatedFoodMarker
            key={`${segment.entry.id}-${metric}-marker`}
            segment={segment}
            scale={scale}
          />
        ))}
        <Animated.View
          key={`${metric}-${displayValue}`}
          entering={FadeIn.duration(180)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 118 * scale,
            alignItems: 'center',
          }}>
          <Text
            selectable
            style={{
              fontFamily: AppFonts.medium,
              fontSize: Math.max(52, 68 * scale),
              lineHeight: Math.max(60, 76 * scale),
              color: AppColors.text,
              fontVariant: ['tabular-nums'],
            }}>
            {displayValue}
          </Text>
          <Text
            style={{
              fontFamily: AppFonts.regular,
              fontSize: Math.max(14, 17 * scale),
              color: '#484848',
              marginTop: -2,
            }}>
            {definition.totalLabel}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
