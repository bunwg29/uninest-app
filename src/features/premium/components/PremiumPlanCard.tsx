import { Check } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { PremiumPlan } from '../types';
import { formatVnd } from '../utils';

interface PremiumPlanCardProps {
  plan: PremiumPlan;
  isSelected: boolean;
  onSelect: (plan: PremiumPlan) => void;
}

export const PremiumPlanCard = ({ plan, isSelected, onSelect }: PremiumPlanCardProps) => (
  <TouchableOpacity
    style={[styles.card, isSelected && styles.cardSelected]}
    onPress={() => onSelect(plan)}
    activeOpacity={0.85}
    accessibilityRole="radio"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={`${plan.name}, ${formatVnd(plan.price)}`}
    testID={`premium-plan-${plan.code}`}
  >
    <View style={[styles.radio, isSelected && styles.radioSelected]}>
      {isSelected ? <Check size={14} color={THEME_COLORS.WHITE} /> : null}
    </View>

    <View style={styles.body}>
      <Typography variant="body1" weight="BOLD">
        {plan.name}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        {`${formatVnd(Math.round(plan.price / plan.months))} / tháng`}
      </Typography>
    </View>

    <Typography variant="h3" weight="BOLD" colorKey="PRIMARY_DARK">
      {formatVnd(plan.price)}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  radioSelected: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
  body: { flex: 1, gap: SPACING_TOKENS.XXS },
});
