import { ScrollView, StyleSheet, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { SkeletonBox, SkeletonCircle } from '@ui';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 294;
const SKELETON_CHIP_WIDTHS = [104, 96, 84, 92] as const;
const CARD_PLACEHOLDER_COUNT = 2;

const STRONG_FILL = { backgroundColor: THEME_COLORS.BORDER } as const;

export const HomeSkeleton = () => (
  <View accessibilityLabel="Đang tải trang chủ">
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <SkeletonCircle size={40} />

        <View style={styles.headerText}>
          <SkeletonBox width={96} height={13} />
          <SkeletonBox width={132} height={11} style={styles.headerSubline} />
        </View>

        <SkeletonBox width={40} height={40} borderRadius={BORDER_RADIUS_TOKENS.MD} />
        <SkeletonBox
          width={40}
          height={40}
          borderRadius={BORDER_RADIUS_TOKENS.MD}
          style={styles.headerButton}
        />
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        <SkeletonBox width={180} height={13} style={[styles.searchLine, STRONG_FILL]} />
      </View>
    </View>

    <ScrollView
      horizontal
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {SKELETON_CHIP_WIDTHS.map((width) => (
        <SkeletonBox
          key={width}
          width={width}
          height={36}
          borderRadius={BORDER_RADIUS_TOKENS.FULL}
          style={styles.chip}
        />
      ))}
    </ScrollView>

    <View style={styles.titleBlock}>
      <SkeletonBox width={186} height={20} />
      <SkeletonBox width={212} height={12} style={styles.subtitle} />
    </View>

    <ScrollView
      horizontal
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardRow}
    >
      {Array.from({ length: CARD_PLACEHOLDER_COUNT }).map((_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonBox width={CARD_WIDTH} height={160} borderRadius={0} style={STRONG_FILL} />

          <View style={styles.cardContent}>
            <SkeletonBox width={78} height={20} borderRadius={BORDER_RADIUS_TOKENS.FULL} />
            <SkeletonBox width={246} height={14} style={styles.cardLineFirst} />
            <SkeletonBox width={index === 0 ? 170 : 150} height={14} style={styles.cardLine} />
            <SkeletonBox width={132} height={18} style={styles.cardLine} />
            <SkeletonBox width={196} height={12} style={styles.cardLine} />
          </View>
        </View>
      ))}
    </ScrollView>

    <SkeletonBox
      height={88}
      borderRadius={BORDER_RADIUS_TOKENS.LG}
      style={[styles.banner, STRONG_FILL]}
    />

    <SkeletonBox width={110} height={20} style={styles.nearbyTitle} />

    <SkeletonBox
      height={140}
      borderRadius={BORDER_RADIUS_TOKENS.LG}
      style={[styles.map, STRONG_FILL]}
    />
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXS,
    paddingBottom: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  headerRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD - SPACING_TOKENS.XXS,
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  headerSubline: {
    marginTop: 6,
  },
  headerButton: {
    marginLeft: SPACING_TOKENS.SM,
  },
  searchBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  searchLine: {
    marginLeft: SPACING_TOKENS.SM,
  },
  chipRow: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
  },
  chip: {
    marginRight: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  titleBlock: {
    paddingHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.LG,
  },
  subtitle: {
    marginTop: SPACING_TOKENS.SM - SPACING_TOKENS.XXS,
  },
  cardRow: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD - SPACING_TOKENS.XXS * 2,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardContent: {
    padding: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  cardLineFirst: {
    marginTop: SPACING_TOKENS.SM,
  },
  cardLine: {
    marginTop: SPACING_TOKENS.SM,
  },
  banner: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.LG,
  },
  nearbyTitle: {
    marginTop: SPACING_TOKENS.LG,
    marginLeft: SPACING_TOKENS.MD,
  },
  map: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
});
