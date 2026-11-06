import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { STATUS_LABELS, type SearchCardStatus } from '../utils';

interface StatusPillProps {
  status: SearchCardStatus;
  compact?: boolean;
}

const PILL_COLORS: Record<SearchCardStatus, { background: string; border?: string; text: string }> =
  {
    available: {
      background: THEME_COLORS.SUCCESS_LIGHT,
      border: OVERLAY_COLORS.SUCCESS_BORDER,
      text: THEME_COLORS.SUCCESS,
    },
    featured: { background: THEME_COLORS.SECONDARY, text: THEME_COLORS.TEXT_PRIMARY },
    rented: { background: THEME_COLORS.SURFACE_MUTED, text: THEME_COLORS.TEXT_MUTED },
    paused: { background: THEME_COLORS.SURFACE_MUTED, text: THEME_COLORS.TEXT_MUTED },
  };

export const StatusPill = ({ status, compact = false }: StatusPillProps) => {
  const colors = PILL_COLORS[status];

  return (
    <View
      style={[
        styles.pill,
        compact && styles.compactPill,
        {
          backgroundColor: colors.background,
          borderColor: colors.border ?? THEME_COLORS.TRANSPARENT,
          borderWidth: colors.border ? 1 : 0,
        },
      ]}
    >
      <Typography
        variant="tiny"
        weight="SEMIBOLD"
        color={colors.text}
        style={[styles.label, compact && styles.compactLabel]}
      >
        {STATUS_LABELS[status].toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  compactPill: { height: 20, paddingHorizontal: 8 },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 0.5 },
  compactLabel: { fontSize: 10 },
});
