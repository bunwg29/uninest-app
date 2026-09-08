import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Typography } from './Typography';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const Divider = ({
  orientation = 'horizontal',
  thickness = 1,
  color = THEME_COLORS.BORDER,
  label,
  style,
}: DividerProps) => {
  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: color,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labeledContainer, style]}>
        <View style={[styles.line, { height: thickness, backgroundColor: color }]} />

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.label}>
          {label}
        </Typography>

        <View style={[styles.line, { height: thickness, backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
  labeledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: SPACING_TOKENS.SM,
  },
  line: {
    flex: 1,
  },
  label: {
    paddingHorizontal: SPACING_TOKENS.SM,
  },
});
