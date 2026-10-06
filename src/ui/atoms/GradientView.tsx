import { useId, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface GradientViewProps {
  colors: readonly [string, string];
  angle?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const GradientView = ({ colors, angle = 135, style, children }: GradientViewProps) => {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setSize({ width, height });
  };

  const radians = (angle * Math.PI) / 180;
  const directionX = Math.sin(radians);
  const directionY = -Math.cos(radians);
  const halfLength = (Math.abs(size.width * directionX) + Math.abs(size.height * directionY)) / 2;
  const centerX = size.width / 2;
  const centerY = size.height / 2;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {size.width > 0 ? (
        <Svg style={StyleSheet.absoluteFill} width={size.width} height={size.height}>
          <Defs>
            <LinearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1={centerX - directionX * halfLength}
              y1={centerY - directionY * halfLength}
              x2={centerX + directionX * halfLength}
              y2={centerY + directionY * halfLength}
            >
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>

          <Rect width={size.width} height={size.height} fill={`url(#${gradientId})`} />
        </Svg>
      ) : null}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
