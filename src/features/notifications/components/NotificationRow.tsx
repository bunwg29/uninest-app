import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Bell,
  CalendarCheck,
  CircleCheck,
  Clock3,
  House,
  MessageSquare,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { AppNotification, NotificationType } from '../types';
import { formatNotificationTime } from '../utils/notificationTime';

interface Tone {
  icon: LucideIcon;
  color: string;
  background: string;
}

const TONES: Record<NotificationType, Tone> = {
  booking: {
    icon: CalendarCheck,
    color: THEME_COLORS.SUCCESS,
    background: THEME_COLORS.SUCCESS_LIGHT,
  },
  reminder: { icon: Clock3, color: THEME_COLORS.WARNING, background: THEME_COLORS.WARNING_LIGHT },
  message: {
    icon: MessageSquare,
    color: THEME_COLORS.PRIMARY,
    background: THEME_COLORS.PRIMARY_LIGHT,
  },
  listing: { icon: House, color: THEME_COLORS.PRIMARY, background: THEME_COLORS.PRIMARY_LIGHT },
  forum: { icon: Users, color: THEME_COLORS.TEXT_MUTED, background: THEME_COLORS.SURFACE_MUTED },
  system: { icon: Bell, color: THEME_COLORS.PRIMARY, background: THEME_COLORS.PRIMARY_LIGHT },
};

const WARNING_TONE: Tone = {
  icon: ShieldAlert,
  color: THEME_COLORS.ERROR,
  background: THEME_COLORS.ERROR_LIGHT,
};

const SUCCESS_TONE: Tone = {
  icon: CircleCheck,
  color: THEME_COLORS.SUCCESS,
  background: THEME_COLORS.SUCCESS_LIGHT,
};

const isWarning = (item: AppNotification) =>
  item.type === 'system' && /từ chối|ẩn|cảnh báo/i.test(item.title);

const isApproval = (item: AppNotification) =>
  item.type === 'system' && /được duyệt/i.test(item.title);

const toneOf = (item: AppNotification) => {
  if (isWarning(item)) return WARNING_TONE;

  if (isApproval(item)) return SUCCESS_TONE;

  return TONES[item.type] ?? TONES.system;
};

interface NotificationRowProps {
  item: AppNotification;
  variant: 'list' | 'card';
  onPress: (item: AppNotification) => void;
}

export const NotificationRow = memo(({ item, variant, onPress }: NotificationRowProps) => {
  const tone = toneOf(item);
  const Icon = tone.icon;
  const unread = !item.readAt;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.row,
        variant === 'card' && styles.cardRow,
        unread && variant === 'list' && styles.unreadRow,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Chưa đọc. ' : ''}${item.title}. ${item.body}`}
    >
      <View
        style={[
          styles.icon,
          variant === 'card' && styles.cardIcon,
          { backgroundColor: tone.background },
        ]}
      >
        <Icon size={20} color={tone.color} />
      </View>
      <View style={styles.content}>
        <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
          {item.title}
        </Typography>
        <Typography
          variant="label"
          colorKey={variant === 'card' ? 'TEXT_PLACEHOLDER' : 'TEXT_PRIMARY'}
          numberOfLines={3}
        >
          {item.body}
        </Typography>
        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.time}
        >
          {formatNotificationTime(item.createdAt)}
        </Typography>
      </View>
      {unread ? <View style={styles.dot} /> : <View style={styles.dotSpace} />}
    </Pressable>
  );
});

NotificationRow.displayName = 'NotificationRow';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD - 2,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardRow: {
    paddingVertical: SPACING_TOKENS.MD,
  },
  unreadRow: { backgroundColor: OVERLAY_COLORS.UNREAD_ROW },
  pressed: { opacity: 0.85 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  content: { flex: 1, gap: 2 },
  time: { marginTop: 2, letterSpacing: 0.2 },
  dot: {
    width: 8,
    height: 8,
    marginTop: 7,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  dotSpace: { width: 8 },
});
