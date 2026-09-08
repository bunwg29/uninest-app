import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';

export interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS_TOKENS.SM,
  style,
}: SkeletonBoxProps) => {
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export interface SkeletonCircleProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonCircle = ({ size = 40, style }: SkeletonCircleProps) => {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius={BORDER_RADIUS_TOKENS.FULL}
      style={style}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText = ({ lines = 2, lineHeight = 16, style }: SkeletonTextProps) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1;
        const width: DimensionValue = isLastLine && lines > 1 ? '60%' : '100%';

        return (
          <SkeletonBox
            key={index}
            width={width}
            height={lineHeight}
            borderRadius={BORDER_RADIUS_TOKENS.XS}
            style={index > 0 ? styles.textLineSpacing : undefined}
          />
        );
      })}
    </View>
  );
};

export interface ListingCardSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export const ListingCardSkeleton = ({ style }: ListingCardSkeletonProps) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <SkeletonBox width="100%" height={160} borderRadius={BORDER_RADIUS_TOKENS.LG} />

      <View style={styles.cardContent}>
        <View style={styles.priceRow}>
          <SkeletonBox width={100} height={20} borderRadius={BORDER_RADIUS_TOKENS.XS} />
          <SkeletonBox
            width={40}
            height={14}
            borderRadius={BORDER_RADIUS_TOKENS.XS}
            style={styles.perMonth}
          />
        </View>

        <SkeletonText lines={2} lineHeight={16} style={styles.titleSpacing} />

        <SkeletonBox
          width="70%"
          height={14}
          borderRadius={BORDER_RADIUS_TOKENS.XS}
          style={styles.metaSpacing}
        />

        <SkeletonBox width="45%" height={14} borderRadius={BORDER_RADIUS_TOKENS.XS} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  textContainer: {
    width: '100%',
  },
  textLineSpacing: {
    marginTop: SPACING_TOKENS.XS + 2,
  },
  cardContainer: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    overflow: 'hidden',
    padding: 0,
    marginBottom: SPACING_TOKENS.MD,
  },
  cardContent: {
    padding: SPACING_TOKENS.MD,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.SM,
  },
  perMonth: {
    marginLeft: SPACING_TOKENS.XS,
  },
  titleSpacing: {
    marginBottom: SPACING_TOKENS.SM,
  },
  metaSpacing: {
    marginBottom: SPACING_TOKENS.XS,
  },
});
