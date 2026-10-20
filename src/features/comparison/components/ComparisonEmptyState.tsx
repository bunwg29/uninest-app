import { ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { MAX_COMPARISON_ITEMS } from '../store';
import { CompareIcon } from './CompareIcon';

const CRITERIA = [
  'Giá thuê và tiền cọc',
  'Diện tích và số người ở',
  'Khoảng cách tới trường bạn chọn',
  'Từng tiện ích, xếp cùng thứ tự',
  'Đánh giá và chủ trọ',
] as const;

const ILLUSTRATION_SIZE = 160;
const ILLUSTRATION_ICON_SIZE = 76;

export const ComparisonEmptyState = () => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.illustration}>
      <CompareIcon
        size={ILLUSTRATION_ICON_SIZE}
        color={OVERLAY_COLORS.STEP_PENDING_TEXT}
        strokeWidth={1.5}
      />
    </View>

    <Typography variant="h2" weight="SEMIBOLD" align="center" style={styles.title}>
      Chưa có phòng nào để so sánh
    </Typography>
    <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      {`Nhấn biểu tượng ⊕ trên thẻ phòng bất kỳ để thêm vào đây. So sánh được tối đa ${MAX_COMPARISON_ITEMS} phòng cùng lúc.`}
    </Typography>

    <View style={styles.card}>
      <Typography
        variant="caption"
        weight="MEDIUM"
        colorKey="TEXT_PLACEHOLDER"
        style={styles.cardTitle}
      >
        BẢNG SO SÁNH SẼ ĐỐI CHIẾU
      </Typography>

      {CRITERIA.map((criterion) => (
        <View key={criterion} style={styles.criterionRow}>
          <Check size={16} color={THEME_COLORS.SUCCESS} />
          <Typography variant="label" weight="REGULAR" colorKey="TEXT_SECONDARY">
            {criterion}
          </Typography>
        </View>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: 56, paddingBottom: SPACING_TOKENS.LG },
  illustration: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  title: { marginTop: 24, letterSpacing: -0.3 },
  description: {
    maxWidth: 340,
    marginTop: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    lineHeight: 22,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: 26,
    marginHorizontal: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { letterSpacing: 0.2, marginBottom: SPACING_TOKENS.SM },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM - 2,
    height: 28,
  },
});
