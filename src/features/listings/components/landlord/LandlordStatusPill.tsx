import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { LandlordListingStatus } from '../../types';

export type LandlordPillTone = 'success' | 'warning' | 'error' | 'neutral' | 'featured' | 'info';

interface PillPalette {
  color: string;
  background: string;
  border: string;
}

const PALETTES: Record<LandlordPillTone, PillPalette> = {
  success: {
    color: THEME_COLORS.SUCCESS,
    background: THEME_COLORS.SUCCESS_LIGHT,
    border: OVERLAY_COLORS.SUCCESS_BORDER,
  },
  warning: {
    color: THEME_COLORS.WARNING,
    background: THEME_COLORS.WARNING_LIGHT,
    border: OVERLAY_COLORS.WARNING_BORDER,
  },
  error: {
    color: THEME_COLORS.ERROR,
    background: THEME_COLORS.ERROR_LIGHT,
    border: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
  },
  neutral: {
    color: THEME_COLORS.TEXT_MUTED,
    background: THEME_COLORS.SURFACE_MUTED,
    border: THEME_COLORS.BORDER,
  },
  info: {
    color: THEME_COLORS.PRIMARY_DARK,
    background: THEME_COLORS.PRIMARY_LIGHT,
    border: OVERLAY_COLORS.INFO_BORDER,
  },
  featured: {
    color: THEME_COLORS.TEXT_PRIMARY,
    background: THEME_COLORS.SECONDARY,
    border: THEME_COLORS.SECONDARY,
  },
};

export const LANDLORD_STATUS_LABELS: Record<LandlordListingStatus, string> = {
  published: 'Đang hiển thị',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
  hidden: 'Đã ẩn',
  expired: 'Đã cho thuê',
  paused: 'Ngừng nhận yêu cầu',
};

export const LANDLORD_STATUS_TONES: Record<LandlordListingStatus, LandlordPillTone> = {
  published: 'success',
  pending: 'warning',
  rejected: 'error',
  hidden: 'neutral',
  expired: 'neutral',
  paused: 'neutral',
};

export const LandlordStatusPill = ({ label, tone }: { label: string; tone: LandlordPillTone }) => {
  const palette = PALETTES[tone];

  return (
    <View
      style={[styles.pill, { backgroundColor: palette.background, borderColor: palette.border }]}
    >
      <Typography variant="tiny" weight="BOLD" color={palette.color} style={styles.label}>
        {label.toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 22,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
  },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 0.5 },
});
