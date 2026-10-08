import type { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS, OVERLAY_COLORS } from '@theme';
import { Typography } from '../atoms/Typography';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  hasBorder?: boolean;
  hasShadow?: boolean;
}

export const Card = ({
  children,
  padding = 'md',
  onPress,
  style,
  hasBorder = true,
  hasShadow = true,
}: CardProps) => {
  const containerStyles = [
    styles.card,
    PADDING_STYLES[padding],
    hasBorder && styles.border,
    hasShadow && styles.shadow,
    style,
  ];

  const renderedChildren =
    typeof children === 'string' || typeof children === 'number' ? (
      <Typography>{children}</Typography>
    ) : (
      children
    );

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyles} onPress={onPress} activeOpacity={0.85}>
        {renderedChildren}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{renderedChildren}</View>;
};

const PADDING_STYLES = StyleSheet.create({
  none: {
    padding: 0,
  },
  sm: {
    padding: SPACING_TOKENS.SM,
  },
  md: {
    padding: SPACING_TOKENS.MD,
  },
  lg: {
    padding: SPACING_TOKENS.LG,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  shadow: {
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
