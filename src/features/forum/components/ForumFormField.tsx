import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SPACING_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface ForumFormFieldProps {
  label: string;
  tone?: 'section' | 'caption';
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export const ForumFormField = ({
  label,
  tone = 'section',
  helperText,
  style,
  children,
}: ForumFormFieldProps) => (
  <View style={style}>
    {tone === 'section' ? (
      <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_SECONDARY" style={styles.label}>
        {label}
      </Typography>
    ) : (
      <Typography
        variant="caption"
        weight="MEDIUM"
        colorKey="TEXT_PLACEHOLDER"
        style={[styles.label, styles.caption]}
      >
        {label}
      </Typography>
    )}

    {children}

    {helperText ? (
      <Typography
        variant="caption"
        weight="MEDIUM"
        colorKey="TEXT_PLACEHOLDER"
        style={styles.helper}
      >
        {helperText}
      </Typography>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  label: {
    marginBottom: SPACING_TOKENS.SM - 2,
  },
  caption: {
    letterSpacing: 0.2,
  },
  helper: {
    marginTop: SPACING_TOKENS.SM - 2,
    letterSpacing: 0.2,
  },
});
