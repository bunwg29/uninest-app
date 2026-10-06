import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

export type ForumBadgeTone = 'primary' | 'success' | 'neutral';

export interface ForumBadgeProps {
  label: string;
  tone?: ForumBadgeTone;
}

const TONES: Record<ForumBadgeTone, { background: string; border: string; text: string }> = {
  primary: {
    background: THEME_COLORS.PRIMARY_LIGHT,
    border: OVERLAY_COLORS.INFO_BORDER,
    text: THEME_COLORS.PRIMARY_DARK,
  },
  success: {
    background: THEME_COLORS.SUCCESS_LIGHT,
    border: OVERLAY_COLORS.SUCCESS_BORDER,
    text: THEME_COLORS.SUCCESS,
  },
  neutral: {
    background: THEME_COLORS.SURFACE_MUTED,
    border: THEME_COLORS.BORDER,
    text: THEME_COLORS.TEXT_MUTED,
  },
};

export const ForumBadge = ({ label, tone = 'primary' }: ForumBadgeProps) => {
  const colors = TONES[tone];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      <Typography variant="tiny" weight="SEMIBOLD" color={colors.text} style={styles.label}>
        {label.toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 22,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
});
