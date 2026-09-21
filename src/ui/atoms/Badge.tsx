import type { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from './Typography';

export type BadgeVariant =
  'available' | 'holding' | 'featured' | 'match' | 'counter' | 'neutral' | 'primary' | 'danger';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Badge = ({ label, variant = 'neutral', size = 'md', icon, style }: BadgeProps) => {
  const isCounter = variant === 'counter';
  const config = BADGE_CONFIGS[variant];

  return (
    <View
      style={[
        styles.base,
        isCounter ? styles.counter : SIZE_STYLES[size],
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor || THEME_COLORS.TRANSPARENT,
          borderWidth: config.borderColor ? 1 : 0,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}

      <Typography
        variant={isCounter ? 'tiny' : size === 'sm' ? 'tiny' : 'caption'}
        weight="BOLD"
        color={config.textColor}
      >
        {label}
      </Typography>
    </View>
  );
};

const BADGE_CONFIGS: Record<
  BadgeVariant,
  { backgroundColor: string; textColor: string; borderColor?: string }
> = {
  available: {
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    textColor: THEME_COLORS.SUCCESS,
  },
  holding: {
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    textColor: THEME_COLORS.WARNING,
  },
  featured: {
    backgroundColor: THEME_COLORS.SECONDARY,
    textColor: THEME_COLORS.SURFACE,
  },
  match: {
    backgroundColor: THEME_COLORS.SURFACE,
    textColor: THEME_COLORS.PRIMARY,
    borderColor: THEME_COLORS.BORDER,
  },
  counter: {
    backgroundColor: THEME_COLORS.ERROR,
    textColor: THEME_COLORS.SURFACE,
  },
  neutral: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
  primary: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    textColor: THEME_COLORS.PRIMARY,
  },
  danger: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    textColor: THEME_COLORS.ERROR,
  },
};

const SIZE_STYLES = StyleSheet.create({
  sm: {
    height: 20,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  md: {
    height: 24,
    paddingHorizontal: SPACING_TOKENS.SM + 2,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  iconWrapper: {
    marginRight: 4,
  },
});
