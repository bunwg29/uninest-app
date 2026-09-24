import type { ReactNode } from 'react';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';

export const BOTTOM_TAB_STYLES = StyleSheet.create({
  bar: {
    height: 72,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
  },
  label: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  badge: {
    minWidth: 18,
    height: 18,
    lineHeight: 18,
    borderRadius: 9,
    fontSize: 10,
    fontWeight: '700',
    color: THEME_COLORS.WHITE,
    backgroundColor: THEME_COLORS.ERROR,
  },
});

export const PrimaryTabButton = ({
  accessibilityLabel,
  icon,
  label,
  onPress,
}: {
  accessibilityLabel: string;
  icon: ReactNode;
  label: string;
  onPress?: BottomTabBarButtonProps['onPress'];
}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={styles.button}
    activeOpacity={0.85}
  >
    <View style={styles.circle}>{icon}</View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  circle: {
    width: 52,
    height: 52,
    marginTop: -15,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.PRIMARY,
    elevation: 7,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: { marginTop: 2, color: THEME_COLORS.PRIMARY, fontSize: 10, fontWeight: '600' },
});
