import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingStatus } from '../types';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; background: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    color: THEME_COLORS.WARNING,
    background: THEME_COLORS.WARNING_LIGHT,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: THEME_COLORS.SUCCESS,
    background: THEME_COLORS.SUCCESS_LIGHT,
  },
  holding: {
    label: 'Đang giữ chỗ',
    color: THEME_COLORS.PRIMARY,
    background: THEME_COLORS.PRIMARY_LIGHT,
  },
  expired: {
    label: 'Đã hết hạn',
    color: THEME_COLORS.TEXT_MUTED,
    background: THEME_COLORS.SURFACE_MUTED,
  },
  cancelled: {
    label: 'Đã hủy',
    color: THEME_COLORS.TEXT_MUTED,
    background: THEME_COLORS.SURFACE_MUTED,
  },
};

export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Typography variant="tiny" weight="BOLD" color={config.color}>
        {config.label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});
