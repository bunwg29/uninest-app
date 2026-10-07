import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { SkeletonBox, BackButton } from '@ui';

interface ListingDetailSkeletonProps {
  onBack: () => void;
}

const HERO_HEIGHT = 280;
const SECTION_GAP = 20;
const LINE_GAP = 12;
const AMENITY_ICON_SIZE = 19;
const AMENITY_ROWS = [
  [110, 84],
  [96, 74],
  [102, 120],
] as const;
const DESCRIPTION_WIDTHS = ['100%', '95%', '84%', '53%'] as const;

export const ListingDetailSkeleton = ({ onBack }: ListingDetailSkeletonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root} accessibilityLabel="Đang tải thông tin phòng">
      <View style={styles.hero} />

      <View style={[styles.backWrapper, { top: insets.top + 12 }]}>
        <BackButton onPress={onBack} accessibilityLabel="Quay lại" />
      </View>

      <View style={styles.content}>
        <SkeletonBox width={88} height={22} borderRadius={BORDER_RADIUS_TOKENS.FULL} />
        <SkeletonBox width="74%" height={24} style={styles.line} />
        <SkeletonBox width="51%" height={24} style={styles.line} />
        <SkeletonBox width="41%" height={26} style={styles.line} />
        <SkeletonBox width="59%" height={14} style={styles.line} />
        <SkeletonBox width="82%" height={14} style={styles.line} />
        <SkeletonBox width="64%" height={30} style={styles.line} />

        <View style={styles.divider} />

        <SkeletonBox width={96} height={22} />

        <View style={styles.amenityList}>
          {AMENITY_ROWS.map(([firstWidth, secondWidth], index) => (
            <View key={index} style={styles.amenityRow}>
              <AmenityPlaceholder textWidth={firstWidth} />
              <AmenityPlaceholder textWidth={secondWidth} />
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <SkeletonBox width={76} height={22} />

        <View style={styles.descriptionList}>
          {DESCRIPTION_WIDTHS.map((width) => (
            <SkeletonBox key={width} width={width} height={13} />
          ))}
        </View>
      </View>

      <View
        style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.SM) }]}
      >
        <SkeletonBox width={48} height={48} borderRadius={BORDER_RADIUS_TOKENS.MD} />
        <SkeletonBox
          width="auto"
          height={48}
          borderRadius={BORDER_RADIUS_TOKENS.MD}
          style={styles.flex}
        />
        <View style={[styles.primaryAction, styles.flex]} />
      </View>
    </View>
  );
};

const AmenityPlaceholder = ({ textWidth }: { textWidth: number }) => (
  <View style={styles.amenityItem}>
    <SkeletonBox width={AMENITY_ICON_SIZE} height={AMENITY_ICON_SIZE} borderRadius={5} />
    <SkeletonBox width={textWidth} height={13} />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  hero: { height: HERO_HEIGHT, backgroundColor: THEME_COLORS.BORDER },
  backWrapper: { position: 'absolute', left: SPACING_TOKENS.MD },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  content: {
    flex: 1,
    marginTop: -SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SECTION_GAP,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    overflow: 'hidden',
  },
  line: { marginTop: LINE_GAP },
  divider: {
    height: 1,
    marginTop: SECTION_GAP,
    marginBottom: SECTION_GAP + 1,
    marginHorizontal: -SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.BORDER,
  },
  amenityList: { marginTop: LINE_GAP, gap: LINE_GAP },
  amenityRow: { flexDirection: 'row' },
  amenityItem: {
    width: '48.88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
  },
  descriptionList: { marginTop: LINE_GAP, gap: LINE_GAP },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LINE_GAP,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: LINE_GAP,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  flex: { flex: 1 },
  primaryAction: {
    height: 48,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BORDER,
  },
});
