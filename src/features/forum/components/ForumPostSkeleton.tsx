import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { SkeletonBox, SkeletonCircle } from '@ui';

export type ForumPostSkeletonVariant = 'table' | 'images' | 'compact';

export interface ForumPostSkeletonProps {
  variant?: ForumPostSkeletonVariant;
}

const LINE_RADIUS = BORDER_RADIUS_TOKENS.SM;

export const ForumPostSkeleton = ({ variant = 'table' }: ForumPostSkeletonProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <SkeletonCircle size={40} />

      <View style={styles.headerText}>
        <SkeletonBox width="60%" height={13} borderRadius={LINE_RADIUS} />
        <SkeletonBox width="95%" height={11} borderRadius={LINE_RADIUS} style={styles.metaLine} />
      </View>

      <SkeletonBox width={62} height={22} borderRadius={BORDER_RADIUS_TOKENS.FULL} />
    </View>

    <SkeletonBox width="95%" height={16} borderRadius={LINE_RADIUS} style={styles.titleFirst} />

    <SkeletonBox
      width={variant === 'compact' ? '88%' : '73%'}
      height={16}
      borderRadius={LINE_RADIUS}
      style={styles.titleSecond}
    />

    {variant === 'compact' ? null : (
      <>
        <SkeletonBox width="100%" height={12} borderRadius={LINE_RADIUS} style={styles.bodyFirst} />
        <SkeletonBox width="92%" height={12} borderRadius={LINE_RADIUS} style={styles.bodyLine} />
        <SkeletonBox
          width={variant === 'table' ? '49%' : '75%'}
          height={12}
          borderRadius={LINE_RADIUS}
          style={styles.bodyLine}
        />
      </>
    )}

    {variant === 'table' ? (
      <>
        <SkeletonBox
          width="100%"
          height={88}
          borderRadius={BORDER_RADIUS_TOKENS.MD}
          style={styles.block}
        />

        <View style={styles.statRow}>
          <SkeletonBox width={52} height={16} borderRadius={LINE_RADIUS} />
          <SkeletonBox width={88} height={16} borderRadius={LINE_RADIUS} />
          <SkeletonBox width={52} height={16} borderRadius={LINE_RADIUS} />
        </View>
      </>
    ) : null}

    {variant === 'images' ? (
      <View style={styles.imageRow}>
        {[0, 1, 2].map((item) => (
          <SkeletonBox
            key={item}
            width="30%"
            height={80}
            borderRadius={BORDER_RADIUS_TOKENS.SM + 2}
            style={styles.imageTile}
          />
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    padding: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 2,
  },
  headerText: {
    flex: 1,
  },
  metaLine: {
    marginTop: 6,
  },
  titleFirst: {
    marginTop: SPACING_TOKENS.SM + 4,
  },
  titleSecond: {
    marginTop: SPACING_TOKENS.SM,
  },
  bodyFirst: {
    marginTop: SPACING_TOKENS.SM + 4,
  },
  bodyLine: {
    marginTop: 6,
  },
  block: {
    marginTop: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.BORDER,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM + 4,
    marginTop: SPACING_TOKENS.SM + 4,
  },
  imageRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.SM + 4,
  },
  imageTile: {
    backgroundColor: THEME_COLORS.BORDER,
  },
});
