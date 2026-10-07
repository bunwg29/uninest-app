import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { CircleAlert, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography, KeyboardAvoidingContainer, KeyboardAwareScrollView } from '@ui';

export const LISTING_REPORT_REASON_OPTIONS = [
  { value: 'false_information', label: 'Giá hoặc thông tin sai sự thật' },
  { value: 'already_rented', label: 'Phòng đã cho thuê nhưng chưa gỡ tin' },
  { value: 'scam', label: 'Nghi ngờ lừa đảo, đòi cọc ngoài app' },
  { value: 'other', label: 'Lý do khác' },
] as const;

export type ListingReportReason = (typeof LISTING_REPORT_REASON_OPTIONS)[number]['value'];

interface ReportListingModalProps {
  isVisible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: ListingReportReason, note: string) => void;
}

const NOTE_MAX_LENGTH = 500;
const MAX_CONTENT_WIDTH = 720;
const RADIO_SIZE = 22;
const ROW_HEIGHT = 53;

export const ReportListingModal = ({
  isVisible,
  isSubmitting,
  onClose,
  onSubmit,
}: ReportListingModalProps) => {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ListingReportReason | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isVisible) {
      setReason(null);
      setNote('');
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingContainer style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            style={styles.close}
          >
            <X size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Typography variant="h3" weight="SEMIBOLD">
            Báo cáo tin đăng
          </Typography>
        </View>

        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.column}>
            <View style={styles.intro}>
              <Typography variant="h3" weight="SEMIBOLD">
                Tin này có vấn đề gì?
              </Typography>
              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.introText}>
                Báo cáo của bạn được gửi tới quản trị viên và không hiển thị cho chủ trọ.
              </Typography>
            </View>

            {LISTING_REPORT_REASON_OPTIONS.map((option, index) => {
              const isSelected = reason === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setReason(option.value)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.reasonRow,
                    index > 0 && styles.reasonRowDivided,
                    isSelected && styles.reasonRowSelected,
                  ]}
                >
                  <Typography
                    variant="body1"
                    weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                    colorKey={isSelected ? 'TEXT_PRIMARY' : 'TEXT_SECONDARY'}
                    style={styles.reasonLabel}
                  >
                    {option.label}
                  </Typography>
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                </TouchableOpacity>
              );
            })}

            <View style={styles.noteSection}>
              <Typography variant="body2" weight="SEMIBOLD">
                {'Mô tả thêm '}
                <Typography variant="body2" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
                  (không bắt buộc)
                </Typography>
              </Typography>

              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
                multiline
                maxLength={NOTE_MAX_LENGTH}
                accessibilityLabel="Mô tả thêm"
              />

              <View style={styles.noteMeta}>
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  Không chia sẻ số điện thoại trong phần này
                </Typography>
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  {`${note.length} / ${NOTE_MAX_LENGTH}`}
                </Typography>
              </View>
            </View>

            <View style={styles.warning}>
              <CircleAlert size={18} color={THEME_COLORS.ERROR} />
              <Typography
                variant="label"
                weight="REGULAR"
                colorKey="ERROR"
                style={styles.warningText}
              >
                Nếu chủ trọ yêu cầu chuyển cọc ngoài app, đừng chuyển. Mọi khoản cọc hợp lệ đều đi
                qua UniNest.
              </Typography>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
        >
          <View style={styles.column}>
            <Button
              title="Gửi báo cáo"
              variant="danger"
              size="lg"
              fullWidth
              disabled={reason === null}
              isLoading={isSubmitting}
              onPress={() => reason && onSubmit(reason, note.trim())}
            />
          </View>
        </View>
      </KeyboardAvoidingContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING_TOKENS.SM,
  },
  content: { paddingBottom: SPACING_TOKENS.LG },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  intro: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD + SPACING_TOKENS.XS,
    paddingBottom: SPACING_TOKENS.SM,
  },
  introText: { marginTop: SPACING_TOKENS.SM },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ROW_HEIGHT,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  reasonRowDivided: { borderTopWidth: 1, borderTopColor: THEME_COLORS.DIVIDER },
  reasonRowSelected: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  reasonLabel: { flex: 1, paddingRight: SPACING_TOKENS.MD },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  radioSelected: { borderWidth: 6, borderColor: THEME_COLORS.PRIMARY },
  noteSection: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.LG,
  },
  input: {
    height: 104,
    marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS - 1,
    padding: SPACING_TOKENS.MD - 2,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 22,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING_TOKENS.SM,
  },
  warning: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.MD - 2,
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD - 2,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  warningText: { flex: 1, fontWeight: '400' },
  footer: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
});
