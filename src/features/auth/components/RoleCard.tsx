import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { GraduationCap, Building2, CheckCircle2, Circle } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '@ui';
import type { UserRole } from '../types';

export interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

export const RoleCard = ({ role, title, description, isSelected, onSelect }: RoleCardProps) => {
  const isStudent = role === 'student';

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(role)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
        {isStudent ? (
          <GraduationCap
            size={28}
            color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_SECONDARY}
          />
        ) : (
          <Building2
            size={28}
            color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_SECONDARY}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Typography
          variant="h4"
          weight="SEMIBOLD"
          color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
          style={styles.title}
        >
          {title}
        </Typography>

        <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED} style={styles.description}>
          {description}
        </Typography>
      </View>

      <View style={styles.radioWrapper}>
        {isSelected ? (
          <CheckCircle2 size={24} color={THEME_COLORS.PRIMARY} />
        ) : (
          <Circle size={24} color={THEME_COLORS.BORDER} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 2,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: SPACING_TOKENS.MD,
    minHeight: 88,
  },
  cardSelected: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING_TOKENS.MD,
  },
  iconWrapperSelected: {
    backgroundColor: THEME_COLORS.SURFACE,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING_TOKENS.SM,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    lineHeight: 18,
  },
  radioWrapper: {
    marginLeft: SPACING_TOKENS.XS,
  },
});
