import { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';

const MAP_HEIGHT = 140;
const STRIPE_ANGLE_DEGREES = 64;
const STRIPE_WIDTH = 2;
const STRIPE_START_RATIO = 0.06786;
const STRIPE_PERIOD_RATIO = 0.07308;

interface StripeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const buildStripes = (width: number): StripeLine[] => {
  const radians = (STRIPE_ANGLE_DEGREES * Math.PI) / 180;
  const directionX = Math.sin(radians);
  const directionY = -Math.cos(radians);
  const perpendicularX = -directionY;
  const perpendicularY = directionX;
  const gradientLength = Math.abs(width * directionX) + Math.abs(MAP_HEIGHT * directionY);
  const centerX = width / 2;
  const centerY = MAP_HEIGHT / 2;
  const reach = width + MAP_HEIGHT;
  const stripes: StripeLine[] = [];

  for (
    let ratio = STRIPE_START_RATIO + STRIPE_WIDTH / gradientLength / 2;
    ratio < 1;
    ratio += STRIPE_PERIOD_RATIO
  ) {
    const offset = ratio * gradientLength - gradientLength / 2;
    const pointX = centerX + directionX * offset;
    const pointY = centerY + directionY * offset;

    stripes.push({
      x1: pointX - perpendicularX * reach,
      y1: pointY - perpendicularY * reach,
      x2: pointX + perpendicularX * reach,
      y2: pointY + perpendicularY * reach,
    });
  }

  return stripes;
};

interface NearbyMapPreviewProps {
  listings?: Array<{ id: string; location?: { latitude: number; longitude: number } }>;
  onPress?: () => void;
}

export const NearbyMapPreview = (_props: NearbyMapPreviewProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const width = windowWidth - SPACING_TOKENS.MD * 2;
  const stripes = useMemo(() => buildStripes(width), [width]);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width={width} height={MAP_HEIGHT}>
        {stripes.map((stripe, index) => (
          <Line
            key={index}
            {...stripe}
            stroke={OVERLAY_COLORS.MAP_STRIPE}
            strokeWidth={STRIPE_WIDTH}
          />
        ))}
      </Svg>

      <View style={styles.tint} />
      <View style={[styles.road, styles.mainRoad]} />
      <View style={[styles.road, styles.sideRoad]} />
      <View style={styles.pin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    marginHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
    backgroundColor: OVERLAY_COLORS.MAP_LAND,
  },
  tint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: OVERLAY_COLORS.MAP_TINT,
  },
  road: {
    position: 'absolute',
    top: 0,
    height: MAP_HEIGHT,
    backgroundColor: THEME_COLORS.WHITE,
  },
  mainRoad: {
    left: 120,
    width: 8,
  },
  sideRoad: {
    left: 250,
    width: 6,
  },
  pin: {
    position: 'absolute',
    top: 22,
    left: 36,
    width: 53,
    height: 30,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
});
