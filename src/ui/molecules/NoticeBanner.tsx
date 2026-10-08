import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '../atoms/Typography';

export type NoticeTone = 'info' | 'warning' | 'success' | 'error';

const TONES = {
  info: {
    background: THEME_COLORS.PRIMARY_LIGHT,
    border: OVERLAY_COLORS.INFO_BORDER,
    color: THEME_COLORS.PRIMARY_DARK,
  },
  warning: {
    background: THEME_COLORS.WARNING_LIGHT,
    border: OVERLAY_COLORS.WARNING_BORDER,
    color: THEME_COLORS.WARNING,
  },
  success: {
    background: THEME_COLORS.SUCCESS_LIGHT,
    border: OVERLAY_COLORS.SUCCESS_BORDER,
    color: THEME_COLORS.SUCCESS,
  },
  error: {
    background: THEME_COLORS.ERROR_LIGHT,
    border: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
    color: THEME_COLORS.ERROR,
  },
} as const;

export interface NoticeBannerProps {
  tone: NoticeTone;
  icon: LucideIcon;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const NoticeBanner = ({ tone, icon: Icon, children, style }: NoticeBannerProps) => {
  const palette = TONES[tone];

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: palette.background, borderColor: palette.border },
        style,
      ]}
    >
      <Icon size={18} color={palette.color} style={styles.icon} />
      <Typography variant="label" weight="REGULAR" color={palette.color} style={styles.text}>
        {children}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  icon: { marginTop: 1 },
  text: { flex: 1 },
});
