import { TouchableOpacity, type Insets, type StyleProp, type ViewStyle } from 'react-native';
import { Heart } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';

export interface SaveButtonProps {
  isSaved: boolean;
  onPress: () => void;
  size?: number;
  inactiveColor?: string;
  activeColor?: string;
  hitSlop?: Insets;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const SaveButton = ({
  isSaved,
  onPress,
  size = 20,
  inactiveColor = THEME_COLORS.TEXT_SECONDARY,
  activeColor = THEME_COLORS.ERROR,
  hitSlop,
  activeOpacity,
  style,
  accessibilityLabel,
}: SaveButtonProps) => {
  const color = isSaved ? activeColor : inactiveColor;

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      hitSlop={hitSlop}
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      accessibilityState={{ selected: isSaved }}
      accessibilityLabel={accessibilityLabel ?? (isSaved ? 'Bỏ lưu phòng' : 'Lưu phòng')}
    >
      <Heart size={size} color={color} fill={isSaved ? activeColor : THEME_COLORS.TRANSPARENT} />
    </TouchableOpacity>
  );
};
