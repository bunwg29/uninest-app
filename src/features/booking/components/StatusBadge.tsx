import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingStatus } from '../types';

interface BadgePalette {
  color: string;
  background: string;
  border: string;
}

const NEUTRAL_PALETTE: BadgePalette = {
  color: THEME_COLORS.TEXT_MUTED,
  background: THEME_COLORS.SURFACE_MUTED,
  border: THEME_COLORS.BORDER,
};

const STATUS_CONFIG: Record<BookingStatus, BadgePalette & { label: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    color: THEME_COLORS.PRIMARY_DARK,
    background: THEME_COLORS.PRIMARY_LIGHT,
    border: OVERLAY_COLORS.INFO_BORDER,
  },
  confirmed: { label: 'Đã xác nhận', ...NEUTRAL_PALETTE },
  holding: {
    label: 'Đang giữ chỗ',
    color: THEME_COLORS.PRIMARY_DARK,
    background: THEME_COLORS.PRIMARY_LIGHT,
    border: OVERLAY_COLORS.INFO_BORDER,
  },
  expired: { label: 'Đã hết hạn', ...NEUTRAL_PALETTE },
  rejected: {
    label: 'Bị từ chối',
    color: THEME_COLORS.ERROR,
    background: THEME_COLORS.ERROR_LIGHT,
    border: OVERLAY_COLORS.ERROR_BORDER,
  },
  cancelled: { label: 'Đã hủy', ...NEUTRAL_PALETTE },
};

const BadgePill = ({ label, palette }: { label: string; palette: BadgePalette }) => (
  <View
    style={[styles.badge, { backgroundColor: palette.background, borderColor: palette.border }]}
  >
    <Typography variant="tiny" weight="SEMIBOLD" color={palette.color} style={styles.label}>
      {label}
    </Typography>
  </View>
);

export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const config = STATUS_CONFIG[status];

  return <BadgePill label={config.label} palette={config} />;
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    height: 22,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
});
