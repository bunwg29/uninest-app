import { View, StyleSheet } from 'react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface DateSeparatorProps {
  label: string;
}

export const DateSeparator = ({ label }: DateSeparatorProps) => (
  <View style={styles.container}>
    <View style={styles.pill}>
      <Typography variant="tiny" weight="SEMIBOLD" colorKey="TEXT_PLACEHOLDER" style={styles.label}>
        {label}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: SPACING_TOKENS.SM + 2,
    marginBottom: SPACING_TOKENS.MD - 2,
  },
  pill: {
    backgroundColor: THEME_COLORS.BORDER,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingVertical: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
  },
});
