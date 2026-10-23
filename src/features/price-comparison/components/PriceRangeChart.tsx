import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { InterestedPriceMarker, PriceComparisonItem } from '../types';
import { formatMonthlyPrice, formatPriceDataPeriod } from '../utils';

interface PriceRangeChartProps {
  item: PriceComparisonItem;
  interestedMarkers: InterestedPriceMarker[];
}

const CHART_HORIZONTAL_PADDING = 18;
const CHART_HEIGHT = 82;

export const PriceRangeChart = ({ item, interestedMarkers }: PriceRangeChartProps) => {
  const [width, setWidth] = useState(0);
  const prices = [
    item.popularPriceMin,
    item.avgPrice,
    item.popularPriceMax,
    ...interestedMarkers.map((marker) => marker.price),
  ].filter((price): price is number => price !== null);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const padding = Math.max((maximum - minimum) * 0.15, 100_000);
  const domainMin = Math.max(0, minimum - padding);
  const domainMax = maximum + padding;
  const drawableWidth = Math.max(1, width - CHART_HORIZONTAL_PADDING * 2);
  const positionFor = (price: number) =>
    CHART_HORIZONTAL_PADDING + ((price - domainMin) / (domainMax - domainMin)) * drawableWidth;

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View>
          <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
            GIÁ TRUNG BÌNH KHU VỰC
          </Typography>
          <Typography variant="h2" weight="BOLD" colorKey="PRIMARY_DARK">
            {formatMonthlyPrice(item.avgPrice ?? 0)} / tháng
          </Typography>
        </View>
        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
          {`${item.sampleCount} tin`}
        </Typography>
      </View>

      <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && item.popularPriceMin !== null && item.popularPriceMax !== null ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Line
              x1={CHART_HORIZONTAL_PADDING}
              y1={42}
              x2={width - CHART_HORIZONTAL_PADDING}
              y2={42}
              stroke={THEME_COLORS.BORDER}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Rect
              x={positionFor(item.popularPriceMin)}
              y={35}
              width={Math.max(
                6,
                positionFor(item.popularPriceMax) - positionFor(item.popularPriceMin)
              )}
              height={14}
              rx={7}
              fill={THEME_COLORS.PRIMARY_LIGHT}
              stroke={THEME_COLORS.PRIMARY}
            />
            {item.avgPrice !== null ? (
              <Circle
                cx={positionFor(item.avgPrice)}
                cy={42}
                r={7}
                fill={THEME_COLORS.PRIMARY_DARK}
              />
            ) : null}
            {interestedMarkers.map((marker, index) => (
              <Circle
                key={marker.id}
                cx={positionFor(marker.price)}
                cy={index % 2 === 0 ? 20 : 64}
                r={5}
                fill={THEME_COLORS.SECONDARY}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <View style={styles.rangeLabels}>
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {`P25 · ${formatMonthlyPrice(item.popularPriceMin ?? 0)}`}
        </Typography>
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {`${formatMonthlyPrice(item.popularPriceMax ?? 0)} · P75`}
        </Typography>
      </View>

      {interestedMarkers.length > 0 ? (
        <View style={styles.interestedList}>
          <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_SECONDARY">
            PHÒNG ĐANG QUAN TÂM
          </Typography>
          {interestedMarkers.map((marker) => (
            <View key={marker.id} style={styles.interestedRow}>
              <View style={styles.interestedDot} />
              <Typography variant="caption" numberOfLines={1} style={styles.interestedTitle}>
                {marker.title}
              </Typography>
              <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
                {formatMonthlyPrice(marker.price)}
              </Typography>
            </View>
          ))}
        </View>
      ) : (
        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" align="center">
          Thêm phòng vào danh sách so sánh để xem vị trí giá tại đây.
        </Typography>
      )}

      <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" align="center">
        {`Dữ liệu ${formatPriceDataPeriod(item.dataFrom, item.dataTo)} · cập nhật ${new Date(item.computedAt).toLocaleDateString('vi-VN')}`}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chart: {
    height: CHART_HEIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  interestedList: { gap: SPACING_TOKENS.XS },
  interestedRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  interestedDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  interestedTitle: { flex: 1 },
});
