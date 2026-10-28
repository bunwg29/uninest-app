import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

interface AiCriteriaChipsProps {
  labels: string[];
}

export const AiCriteriaChips = ({ labels }: AiCriteriaChipsProps) => {
  if (labels.length === 0) return null;

  return (
    <View style={styles.row}>
      {labels.map((label) => (
        <View key={label} style={styles.chip}>
          <Typography variant="label" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
            {label}
          </Typography>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 34,
    paddingHorizontal: SPACING_TOKENS.MD - 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
