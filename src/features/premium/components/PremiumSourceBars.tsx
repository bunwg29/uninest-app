import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { PREMIUM_SOURCE_LABELS, type PremiumSourceStat } from '../types';
import { formatPercent } from '../utils';

interface PremiumSourceBarsProps {
  sources: PremiumSourceStat[];
  totalViews: number;
}

export const PremiumSourceBars = ({ sources, totalViews }: PremiumSourceBarsProps) => (
  <View style={styles.card}>
    <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
      NGUỒN TRUY CẬP
    </Typography>

    {totalViews === 0 ? (
      <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
        Chưa có lượt xem trong khoảng thời gian này.
      </Typography>
    ) : (
      sources
        .filter((item) => item.views > 0)
        .map((item) => (
          <View key={item.source} style={styles.row}>
            <View style={styles.rowHeader}>
              <Typography variant="body2" weight="MEDIUM">
                {PREMIUM_SOURCE_LABELS[item.source]}
              </Typography>
              <Typography variant="caption" colorKey="TEXT_MUTED">
                {`${item.views.toLocaleString('vi-VN')} · ${formatPercent(item.ratio)}`}
              </Typography>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(2, item.ratio * 100)}%` }]} />
            </View>
          </View>
        ))
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  row: { gap: SPACING_TOKENS.XS },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  fill: {
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
