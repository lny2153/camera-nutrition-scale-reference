import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppColors } from '@/constants/theme';

export function ScaleIllustration({ width = 310 }: { width?: number }) {
  const height = width * 0.56;
  return (
    <Svg
      accessibilityLabel="卡路里秤外形示意图"
      width={width}
      height={height}
      viewBox="0 0 310 174">
      <Path
        d="M34 126 L56 44 Q60 29 78 25 L237 48 Q252 50 260 62 L280 107 Q285 121 271 132 L116 159 Q92 163 72 153 L43 140 Q31 135 34 126 Z"
        fill="#F4F5F7"
        stroke="#B9BDC6"
        strokeWidth={3}
      />
      <Path
        d="M58 52 Q62 38 80 34 L233 55 Q245 57 249 68 L257 92 Q261 103 249 108 L100 129 Q83 132 68 124 L49 113 Q42 109 45 100 Z"
        fill="#D9DCE2"
        stroke="#AEB3BD"
        strokeWidth={2}
      />
      <Path
        d="M34 126 Q32 136 44 141 L73 154 Q93 164 116 159 L271 132 Q283 127 281 115 L279 128 Q278 140 264 144 L116 170 Q91 174 69 163 L41 150 Q29 144 31 133 Z"
        fill="#E8EAF0"
        stroke="#B9BDC6"
        strokeWidth={2}
      />
      <Path
        d="M35 119 L45 89 Q48 80 58 80 L133 91 Q142 92 145 101 L151 126 L99 135 Q82 138 66 131 Z"
        fill="#1D1E22"
      />
      <Circle cx={62} cy={101} r={6} fill="#343741" stroke="#797D88" strokeWidth={2} />
      <Circle cx={62} cy={101} r={2} fill="#8499FF" />
      <Rect x={79} y={95} width={26} height={22} rx={7} fill="#2B2D33" stroke="#78EF67" strokeWidth={2} />
      <Path d="M85 106 L99 106 M92 99 L92 113" stroke="#F2F2F4" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M119 101 L139 104" stroke="#666B75" strokeWidth={2} strokeLinecap="round" />
      <Path d="M118 110 L141 113" stroke="#666B75" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={136} cy={120} r={18} fill="#2A2C31" stroke="#656A75" strokeWidth={4} />
      <Path d="M127 120 L145 120 M136 111 L136 129" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      <Path d="M136 102 A18 18 0 0 1 153 115" fill="none" stroke={AppColors.green} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}
