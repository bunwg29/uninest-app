import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { BottomSheet, Button, KeyboardAwareScrollView, Typography } from '@ui';

interface ReasonModalProps {
  isVisible: boolean;
  title: string;
  description?: string;
  confirmTitle: string;
  reasons: readonly string[];
  otherReason?: string;
  confirmTone?: 'primary' | 'danger';
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const MAX_REASON_LENGTH = 500;

export const OTHER_REASON_LABEL = 'Lý do khác';

export const REJECT_REASONS = [
  'Bận vào khung giờ đó',
  'Phòng đã cho thuê',
  'Không phù hợp yêu cầu của nhà trọ',
] as const;

export const ReasonModal = ({
  isVisible,
  title,
  description,
  confirmTitle,
  reasons,
  otherReason = OTHER_REASON_LABEL,
  confirmTone = 'primary',
  isLoading = false,
  onClose,
  onConfirm,
}: ReasonModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isVisible) {
      setSelected(reasons[0] ?? null);
      setMessage('');
    }
  }, [isVisible, reasons]);

  const options = [...reasons, otherReason];
  const trimmedMessage = message.trim();
  const isOther = selected === otherReason;
  const canSubmit = selected !== null && (!isOther || trimmedMessage.length > 0);

  const handleSubmit = () => {
    if (!selected || !canSubmit) return;

    const reason = isOther
      ? trimmedMessage
      : trimmedMessage
        ? `${selected}. ${trimmedMessage}`
        : selected;

    onConfirm(reason);
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropColor={OVERLAY_COLORS.MODAL_BACKDROP}
      keyboardAvoiding
      applyBottomInset={false}
      sheetStyle={styles.sheet}
      handleStyle={styles.handle}
    >
      <KeyboardAwareScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h3" weight="SEMIBOLD">
            {title}
          </Typography>
          {description ? (
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              {description}
            </Typography>
          ) : null}
        </View>

        <View style={styles.options}>
          {options.map((option, index) => {
            const isSelected = option === selected;

            return (
              <View key={option}>
                {index > 0 ? <View style={styles.separator} /> : null}
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => setSelected(option)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option}
                >
                  <Typography
                    variant="body1"
                    weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                    color={isSelected ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_SECONDARY}
                    style={styles.optionLabel}
                  >
                    {option}
                  </Typography>
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.messageBlock}>
          <Typography
            variant="body2"
            weight="SEMIBOLD"
            colorKey="TEXT_SECONDARY"
            style={styles.label}
          >
            {isOther ? 'Nội dung ' : 'Nhắn thêm '}
            <Typography variant="body2" colorKey="TEXT_PLACEHOLDER" style={styles.label}>
              {isOther ? '(bắt buộc)' : '(không bắt buộc)'}
            </Typography>
          </Typography>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập lời nhắn cho sinh viên..."
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            multiline
            maxLength={MAX_REASON_LENGTH}
            accessibilityLabel="Lời nhắn thêm"
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={confirmTitle}
            size="lg"
            variant={confirmTone === 'danger' ? 'danger' : 'primary'}
            disabled={!canSubmit}
            isLoading={isLoading}
            onPress={handleSubmit}
            textStyle={styles.confirmText}
          />
        </View>
      </KeyboardAwareScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '92%',
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  handle: {
    marginTop: 10,
  },
  header: { gap: 4, paddingHorizontal: 16, paddingTop: 28, paddingBottom: 4 },
  options: { paddingTop: 10 },
  separator: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  option: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  optionSelected: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  optionLabel: { flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  radioSelected: { borderWidth: 6, borderColor: THEME_COLORS.PRIMARY },
  messageBlock: { gap: 6, padding: 16, paddingTop: 18 },
  label: { fontSize: 13, lineHeight: 20 },
  input: {
    minHeight: 76,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 17,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  footer: { padding: 16 },
  confirmText: { fontSize: 16, lineHeight: 24 },
});
