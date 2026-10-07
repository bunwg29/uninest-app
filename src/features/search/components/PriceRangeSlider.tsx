import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';

export const PRICE_SLIDER_MAX = 10_000_000;
const PRICE_SLIDER_STEP = 100_000;
const THUMB_SIZE = 32;
const TRACK_HEIGHT = 8;
const CONTAINER_HEIGHT = 48;
const THUMB_HIT_SLOP = 12;

interface PriceRangeSliderProps {
  minValue?: number;
  maxValue?: number;
  onChange: (range: { minPrice?: number; maxPrice?: number }) => void;
}

type ThumbKind = 'min' | 'max';

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(Math.max(value, lower), upper);

const snap = (value: number) => Math.round(value / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP;

export const PriceRangeSlider = ({ minValue, maxValue, onChange }: PriceRangeSliderProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const lower = clamp(minValue ?? 0, 0, PRICE_SLIDER_MAX);
  const upper = clamp(maxValue ?? PRICE_SLIDER_MAX, 0, PRICE_SLIDER_MAX);
  const latest = useRef({ lower, upper, trackWidth, onChange });
  const dragStart = useRef(0);

  latest.current = { lower, upper, trackWidth, onChange };

  const createResponder = (kind: ThumbKind) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragStart.current = kind === 'min' ? latest.current.lower : latest.current.upper;
      },
      onPanResponderMove: (_event, gesture) => {
        const { lower: currentLower, upper: currentUpper, trackWidth: width } = latest.current;

        if (width <= 0) return;

        const usable = Math.max(width - THUMB_SIZE, 1);
        const next = snap(dragStart.current + (gesture.dx / usable) * PRICE_SLIDER_MAX);

        if (kind === 'min') {
          const value = clamp(next, 0, currentUpper - PRICE_SLIDER_STEP);

          latest.current.onChange({
            minPrice: value <= 0 ? undefined : value,
            maxPrice: currentUpper >= PRICE_SLIDER_MAX ? undefined : currentUpper,
          });
        } else {
          const value = clamp(next, currentLower + PRICE_SLIDER_STEP, PRICE_SLIDER_MAX);

          latest.current.onChange({
            minPrice: currentLower <= 0 ? undefined : currentLower,
            maxPrice: value >= PRICE_SLIDER_MAX ? undefined : value,
          });
        }
      },
    });

  const minResponder = useMemo(() => createResponder('min'), []);
  const maxResponder = useMemo(() => createResponder('max'), []);

  const handleLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  const lowerRatio = lower / PRICE_SLIDER_MAX;
  const upperRatio = upper / PRICE_SLIDER_MAX;
  const usableWidth = Math.max(trackWidth - THUMB_SIZE, 0);

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      accessibilityRole="adjustable"
      accessibilityLabel="Khoảng giá"
    >
      <View style={styles.track} />
      <View
        style={[
          styles.fill,
          {
            left: THUMB_SIZE / 2 + lowerRatio * usableWidth,
            width: (upperRatio - lowerRatio) * usableWidth,
          },
        ]}
      />
      <View
        style={[styles.thumb, { left: lowerRatio * usableWidth }]}
        hitSlop={THUMB_HIT_SLOP}
        {...minResponder.panHandlers}
      />
      <View
        style={[styles.thumb, { left: upperRatio * usableWidth }]}
        hitSlop={THUMB_HIT_SLOP}
        {...maxResponder.panHandlers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: CONTAINER_HEIGHT, justifyContent: 'center' },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  fill: {
    position: 'absolute',
    top: (CONTAINER_HEIGHT - TRACK_HEIGHT) / 2,
    height: TRACK_HEIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  thumb: {
    position: 'absolute',
    top: (CONTAINER_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderWidth: 4,
    borderColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.WHITE,
  },
});
