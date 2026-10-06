import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CreditCard, Phone, ShieldAlert } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import type { ModerationResult, ModerationViolationType } from '../types';

export interface ModerationWarningModalProps {
  result: ModerationResult | null;
  isSubmitting?: boolean;
  onEdit: () => void;
  onAutoRemove: () => void;
  onPublishAnyway: () => void;
}

const VIOLATION_ICONS: Record<ModerationViolationType, typeof Phone> = {
  phone_number: Phone,
  bank_account: CreditCard,
  keyword: ShieldAlert,
};

export const ModerationWarningModal = ({
  result,
  isSubmitting = false,
  onEdit,
  onAutoRemove,
  onPublishAnyway,
}: ModerationWarningModalProps) => {
  const violations = result?.violations ?? [];
  const canPublishAnyway = Boolean(result && !result.isBlocked && result.hasWarnings);

  return (
    <Modal visible={Boolean(result)} transparent animationType="fade" onRequestClose={onEdit}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={26} color={THEME_COLORS.ERROR} />
          </View>

          <Typography variant="h3" weight="BOLD" align="center">
            Bài viết có nội dung cần sửa
          </Typography>

          <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.subtitle}>
            Hệ thống phát hiện {violations.length} chỗ vi phạm quy định cộng đồng. Sửa lại trước khi
            đăng để tránh bị ẩn tự động.
          </Typography>

          <ScrollView style={styles.violationList} contentContainerStyle={styles.violationContent}>
            {violations.map((violation, index) => {
              const Icon = VIOLATION_ICONS[violation.type];

              return (
                <View
                  key={`${violation.field}-${violation.type}-${index}`}
                  style={styles.violation}
                >
                  <Icon size={16} color={THEME_COLORS.ERROR} style={styles.violationIcon} />

                  <Typography variant="body2" colorKey="ERROR" style={styles.violationText}>
                    <Typography variant="body2" weight="BOLD" colorKey="ERROR">
                      {violation.label}
                    </Typography>
                    {` "${violation.matches.join('", "')}" — ${violation.message}`}
                  </Typography>
                </View>
              );
            })}
          </ScrollView>

          <Button title="Quay lại sửa bài" size="lg" fullWidth onPress={onEdit} />

          <Button
            title={`Tự động xoá ${violations.length} phần này`}
            variant="outline"
            size="lg"
            fullWidth
            onPress={onAutoRemove}
            style={styles.secondaryButton}
          />

          {canPublishAnyway ? (
            <TouchableOpacity
              style={styles.publishAnyway}
              onPress={onPublishAnyway}
              disabled={isSubmitting}
            >
              <Typography variant="caption" colorKey="TEXT_MUTED" align="center">
                Tôi hiểu rủi ro, vẫn đăng bài
              </Typography>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 27, 34, 0.45)',
    justifyContent: 'center',
    padding: SPACING_TOKENS.LG,
  },
  dialog: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.XL,
    padding: SPACING_TOKENS.LG,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  iconCircle: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  subtitle: {
    marginTop: SPACING_TOKENS.XS,
  },
  violationList: {
    marginVertical: SPACING_TOKENS.MD,
  },
  violationContent: {
    gap: SPACING_TOKENS.SM,
  },
  violation: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: '#F5C2C2',
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  violationIcon: {
    marginTop: 2,
    marginRight: SPACING_TOKENS.SM,
  },
  violationText: {
    flex: 1,
  },
  secondaryButton: {
    marginTop: SPACING_TOKENS.SM,
  },
  publishAnyway: {
    marginTop: SPACING_TOKENS.SM + 4,
    paddingVertical: SPACING_TOKENS.XS,
  },
});
