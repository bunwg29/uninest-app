import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { SkeletonBox, SkeletonCircle } from '@ui';

export const ForumPostSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <SkeletonCircle size={40} />

      <View style={styles.headerText}>
        <SkeletonBox width="45%" height={14} />
        <SkeletonBox width="65%" height={12} style={styles.spacingSm} />
      </View>
    </View>

    <SkeletonBox width="90%" height={18} style={styles.spacingMd} />
    <SkeletonBox width="70%" height={18} style={styles.spacingSm} />
    <SkeletonBox
      width="100%"
      height={72}
      borderRadius={BORDER_RADIUS_TOKENS.MD}
      style={styles.spacingMd}
    />

    <View style={styles.imageRow}>
      <SkeletonBox width="31%" height={72} borderRadius={BORDER_RADIUS_TOKENS.MD} />
      <SkeletonBox width="31%" height={72} borderRadius={BORDER_RADIUS_TOKENS.MD} />
      <SkeletonBox width="31%" height={72} borderRadius={BORDER_RADIUS_TOKENS.MD} />
    </View>
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
    gap: SPACING_TOKENS.SM + 4,
  },
  headerText: {
    flex: 1,
  },
  spacingSm: {
    marginTop: SPACING_TOKENS.SM,
  },
  spacingMd: {
    marginTop: SPACING_TOKENS.MD,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING_TOKENS.MD,
  },
});
