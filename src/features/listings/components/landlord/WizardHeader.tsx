import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Typography, BackButton } from '@ui';

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={onBack} icon={isFirstStep ? 'close' : 'back'} />

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
