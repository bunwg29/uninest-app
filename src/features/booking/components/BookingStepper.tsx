import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';

const STEP_COUNT = 3;

export const BookingStepper = ({ step }: { step: 1 | 2 | 3 }) => (
  <View style={styles.row} accessibilityLabel={`Bước ${step} trên ${STEP_COUNT}`}>
    {Array.from({ length: STEP_COUNT }, (_, index) => (
      <View key={index} style={[styles.bar, index < step ? styles.barActive : null]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 16 },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  barActive: { backgroundColor: THEME_COLORS.PRIMARY },
});
