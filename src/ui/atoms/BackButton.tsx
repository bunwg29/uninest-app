import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';

export const BACK_BUTTON_SIZE = 40;

export interface BackButtonProps {
  onPress: () => void;
  icon?: 'back' | 'close';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const BackButton = ({
  onPress,
  icon = 'back',
  accessibilityLabel,
  style,
}: BackButtonProps) => {
  const Icon = icon === 'close' ? X : ChevronLeft;

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (icon === 'close' ? 'Đóng' : 'Quay lại')}
    >
      <Icon size={22} color={THEME_COLORS.TEXT_PRIMARY} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
