import type { ReactNode } from 'react';
import { Text, StyleSheet, TextStyle, StyleProp, TextProps } from 'react-native';
import { THEME_COLORS, ThemeColorKey, TYPOGRAPHY_TOKENS } from '@theme';

export type TypographyVariant =
  'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'tiny' | 'label';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  colorKey?: ThemeColorKey;
  color?: string;
  weight?: keyof typeof TYPOGRAPHY_TOKENS.FONT_WEIGHTS;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children: ReactNode;
}

export const Typography = ({
  variant = 'body1',
  colorKey = 'TEXT_PRIMARY',
  color,
  weight,
  align = 'left',
  style,
  children,
  ...rest
}: TypographyProps) => {
  const resolvedColor = color || THEME_COLORS[colorKey];
  const variantStyle = VARIANT_STYLES[variant];
  const customWeight = weight ? TYPOGRAPHY_TOKENS.FONT_WEIGHTS[weight] : undefined;

  return (
    <Text
      style={[
        variantStyle,
        {
          color: resolvedColor,
          textAlign: align,
        },
        customWeight ? { fontWeight: customWeight } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const VARIANT_STYLES = StyleSheet.create({
  h1: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.H1,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.H1,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.BOLD,
  },
  h2: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.H2,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.H2,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
  },
  h3: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.H3,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.H3,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
  },
  h4: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.H4,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.H4,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
  },
  body1: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BODY1,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BODY1,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.REGULAR,
  },
  body2: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BODY2,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BODY2,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.REGULAR,
  },
  caption: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.CAPTION,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.CAPTION,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.REGULAR,
  },
  tiny: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.TINY,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.TINY,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
  },
  label: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.SUB,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.MEDIUM,
  },
});
