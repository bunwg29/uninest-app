import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { SkeletonBox } from '@ui';

const LINE_WIDTHS = ['88%', '72%', '62%'] as const;

const SkeletonRow = () => (
  <View style={styles.row}>
    <SkeletonBox
      width={88}
      height={88}
      borderRadius={BORDER_RADIUS_TOKENS.MD}
      style={styles.thumbnail}
    />
    <View style={styles.lines}>
      <SkeletonBox width={72} height={20} borderRadius={BORDER_RADIUS_TOKENS.FULL} />
      {LINE_WIDTHS.map((width, index) => (
        <SkeletonBox
          key={width}
          width={width}
          height={index === 2 ? 16 : 13}
          borderRadius={BORDER_RADIUS_TOKENS.SM}
        />
      ))}
    </View>
  </View>
);

export const SearchResultSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={styles.container} accessibilityLabel="Đang tải danh sách phòng">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonRow key={index} />
    ))}
  </View>
);

export const SearchToolbarSkeleton = () => (
  <View style={styles.toolbar}>
    <SkeletonBox width={126} height={16} borderRadius={BORDER_RADIUS_TOKENS.SM} />
    <SkeletonBox width={118} height={34} borderRadius={BORDER_RADIUS_TOKENS.FULL} />
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 12, padding: SPACING_TOKENS.MD },
  row: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: { backgroundColor: THEME_COLORS.BORDER },
  lines: { flex: 1, gap: 8 },
  toolbar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
