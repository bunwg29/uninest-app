import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

export const WIZARD_STEP_LABELS = [
  'Thông tin cơ bản',
  'Ảnh phòng',
  'Vị trí',
  'Tiện ích',
  'Lịch xem phòng & tiền cọc',
] as const;

interface WizardHeaderProps {
  step: 1 | 2 | 3 | 4 | 5;
  isEditing?: boolean;
  onBack: () => void;
}

export const WizardHeader = ({ step, isEditing = false, onBack }: WizardHeaderProps) => {
  const isFirstStep = step === 1;
  const Icon = isFirstStep ? X : ChevronLeft;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={isFirstStep ? 'Đóng' : 'Quay lại'}
        >
          <Icon size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        <Typography variant="h3" weight="SEMIBOLD" style={styles.title} numberOfLines={1}>
          {isEditing ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
        </Typography>
      </View>

      <View style={styles.bars}>
        {WIZARD_STEP_LABELS.map((label, index) => (
          <View key={label} style={[styles.bar, index < step && styles.barActive]} />
        ))}
      </View>

      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_MUTED" style={styles.stepLabel}>
        {`Bước ${step} / ${WIZARD_STEP_LABELS.length} · ${WIZARD_STEP_LABELS[step - 1]}`}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  backButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
  bars: { flexDirection: 'row', gap: 6, paddingHorizontal: 16 },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  barActive: { backgroundColor: THEME_COLORS.PRIMARY },
  stepLabel: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
});
