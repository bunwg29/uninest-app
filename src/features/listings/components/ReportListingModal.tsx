import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, FilterChip, Typography } from '@ui';

export const LISTING_REPORT_REASON_OPTIONS = [
  { value: 'scam', label: 'Lừa đảo, đòi cọc trước khi xem phòng' },
  { value: 'false_information', label: 'Thông tin sai sự thật' },
  { value: 'wrong_price', label: 'Giá không đúng thực tế' },
  { value: 'already_rented', label: 'Phòng đã cho thuê' },
  { value: 'other', label: 'Lý do khác' },
] as const;

export type ListingReportReason = (typeof LISTING_REPORT_REASON_OPTIONS)[number]['value'];

interface ReportListingModalProps {
  isVisible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: ListingReportReason, note: string) => void;
}

export const ReportListingModal = ({
  isVisible,
  isSubmitting,
  onClose,
  onSubmit,
}: ReportListingModalProps) => {
  const [reason, setReason] = useState<ListingReportReason | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isVisible) {
      setReason(null);
      setNote('');
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Typography variant="h3" weight="BOLD">
          Báo cáo tin đăng
        </Typography>
        <Typography variant="body2" colorKey="TEXT_MUTED">
          Chọn lý do để đội ngũ UniNest kiểm tra tin đăng này.
        </Typography>
        <View style={styles.chips}>
          {LISTING_REPORT_REASON_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              isSelected={reason === option.value}
              onPress={() => setReason(option.value)}
            />
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Mô tả thêm (không bắt buộc)"
          placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
          multiline
          maxLength={500}
        />
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Typography variant="body2" weight="BOLD" colorKey="TEXT_MUTED">
              Đóng
            </Typography>
          </TouchableOpacity>
          <Button
            title="Gửi báo cáo"
            variant="danger"
            disabled={reason === null}
            isLoading={isSubmitting}
            onPress={() => reason && onSubmit(reason, note.trim())}
            style={styles.submit}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  sheet: {
    gap: SPACING_TOKENS.SM,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: SPACING_TOKENS.LG,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME_COLORS.BORDER,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  input: {
    minHeight: 72,
    padding: SPACING_TOKENS.MD,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.MD },
  cancel: { paddingHorizontal: SPACING_TOKENS.MD, paddingVertical: SPACING_TOKENS.SM },
  submit: { flex: 1 },
});
