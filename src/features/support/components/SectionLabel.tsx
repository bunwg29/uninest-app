import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { Typography } from '@ui';

export const SectionLabel = ({
  children,
  style,
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}) => (
  <Typography weight="SEMIBOLD" colorKey="TEXT_PLACEHOLDER" style={[styles.label, style]}>
    {children.toUpperCase()}
  </Typography>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
  },
});
