import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
  accessibilityLabel?: string;
}

export const StarRating = ({
  value,
  onChange,
  size = 22,
  readonly = false,
  accessibilityLabel = 'Điểm đánh giá',
}: StarRatingProps) => (
  <View style={styles.row} accessibilityLabel={`${accessibilityLabel}: ${value} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const icon = (
        <Star
          size={size}
          color={THEME_COLORS.SECONDARY}
          fill={star <= Math.round(value) ? THEME_COLORS.SECONDARY : 'transparent'}
        />
      );

      return readonly ? (
        <View key={star}>{icon}</View>
      ) : (
        <TouchableOpacity
          key={star}
          style={styles.touchTarget}
          onPress={() => onChange?.(star)}
          accessibilityRole="button"
          accessibilityLabel={`${star} sao cho ${accessibilityLabel}`}
        >
          {icon}
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XXS },
  touchTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
