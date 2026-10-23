import { Pressable, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';

interface ToggleSwitchProps {
  value: boolean;
  label: string;
  locked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export const ToggleSwitch = ({ value, label, locked, disabled, onChange }: ToggleSwitchProps) => {
  const trackColor = locked
    ? OVERLAY_COLORS.SWITCH_LOCKED_TRACK
    : value
      ? THEME_COLORS.PRIMARY
      : OVERLAY_COLORS.FIELD_BORDER;

  return (
    <Pressable
      onPress={() => onChange?.(!value)}
      disabled={locked || disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: locked || disabled }}
      accessibilityLabel={locked ? `${label}, luôn bật` : `Nhận thông báo ${label}`}
      style={[styles.track, { backgroundColor: trackColor }, value && styles.trackOn]}
    >
      <View style={styles.thumb} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 27,
    padding: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  trackOn: { alignItems: 'flex-end' },
  thumb: {
    width: 21,
    height: 21,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SWITCH_THUMB_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
});
