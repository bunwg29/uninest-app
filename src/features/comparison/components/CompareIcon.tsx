import Svg, { Line, Rect } from 'react-native-svg';
import { THEME_COLORS } from '@theme';

interface CompareIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CompareIcon = ({
  size = 20,
  color = THEME_COLORS.TEXT_PRIMARY,
  strokeWidth = 2,
}: CompareIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2.5} y={4} width={6} height={16} rx={1.5} stroke={color} strokeWidth={strokeWidth} />
    <Rect x={10.5} y={4} width={6} height={16} rx={1.5} stroke={color} strokeWidth={strokeWidth} />
    <Line
      x1={19.5}
      y1={9.5}
      x2={19.5}
      y2={14.5}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line
      x1={17}
      y1={12}
      x2={22}
      y2={12}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);
