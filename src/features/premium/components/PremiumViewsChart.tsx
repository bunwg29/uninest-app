import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { PremiumDailyStat } from '../types';
import { formatShortDate } from '../utils';

interface PremiumViewsChartProps {
  daily: PremiumDailyStat[];
}

const CHART_HEIGHT = 140;
const CHART_PADDING = 8;
const BAR_GAP = 2;

export const PremiumViewsChart = ({ daily }: PremiumViewsChartProps) => {
  const [width, setWidth] = useState(0);
  const maximum = Math.max(1, ...daily.map((item) => item.views));
  const drawableWidth = Math.max(1, width - CHART_PADDING * 2);
  const barWidth = Math.max(1, drawableWidth / Math.max(1, daily.length) - BAR_GAP);
  const drawableHeight = CHART_HEIGHT - CHART_PADDING * 2;

  return (
    <View style={styles.card}>
      <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
        LƯỢT XEM THEO NGÀY
      </Typography>

      <View style={styles.chart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Line
              x1={CHART_PADDING}
              y1={CHART_HEIGHT - CHART_PADDING}
              x2={width - CHART_PADDING}
              y2={CHART_HEIGHT - CHART_PADDING}
              stroke={THEME_COLORS.BORDER}
              strokeWidth={1}
            />
            {daily.map((item, index) => {
              const height = (item.views / maximum) * drawableHeight;

              return (
                <Rect
                  key={item.date}
                  x={CHART_PADDING + index * (barWidth + BAR_GAP)}
                  y={CHART_HEIGHT - CHART_PADDING - height}
                  width={barWidth}
                  height={Math.max(item.views > 0 ? 2 : 0, height)}
                  rx={2}
                  fill={THEME_COLORS.PRIMARY}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>

      <View style={styles.axis}>
        <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
          {daily.length > 0 ? formatShortDate(daily[0].date) : ''}
        </Typography>
        <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
          {`Cao nhất ${maximum.toLocaleString('vi-VN')} lượt/ngày`}
        </Typography>
        <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
          {daily.length > 0 ? formatShortDate(daily[daily.length - 1].date) : ''}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  chart: {
    height: CHART_HEIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
});
