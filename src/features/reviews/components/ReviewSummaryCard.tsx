import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { ReviewSummary } from '../types';

export const ReviewSummaryCard = ({ summary }: { summary: ReviewSummary }) => {
  const maxCount = Math.max(1, ...Object.values(summary.distribution));

  return (
    <View style={styles.card}>
      <View style={styles.total}>
        <View style={styles.scoreRow}>
          <Star size={24} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
          <Typography variant="h1" weight="BOLD">
            {summary.reviewCount > 0 ? summary.averageRating.toFixed(1).replace('.', ',') : '--'}
          </Typography>
        </View>
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {summary.reviewCount} đánh giá
        </Typography>
      </View>
      <View style={styles.distribution}>
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.distribution[stars] ?? 0;

          return (
            <View key={stars} style={styles.distributionRow}>
              <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.starLabel}>
                {stars} sao
              </Typography>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(count / maxCount) * 100}%` }]} />
              </View>
              <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.count}>
                {count}
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  total: { alignItems: 'center', minWidth: 86 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  distribution: { flex: 1, gap: SPACING_TOKENS.XXS },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  starLabel: { width: 42 },
  track: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  fill: { height: '100%', backgroundColor: THEME_COLORS.SECONDARY },
  count: { width: 20, textAlign: 'right' },
});
