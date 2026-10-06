import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';

interface ReasonModalProps {
  isVisible: boolean;
  title: string;
  description?: string;
  confirmTitle: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const MAX_REASON_LENGTH = 500;

export const ReasonModal = ({
  isVisible,
  title,
  description,
  confirmTitle,
  isLoading = false,
  onClose,
  onConfirm,
}: ReasonModalProps) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isVisible) setReason('');
  }, [isVisible]);

  const trimmedReason = reason.trim();

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Typography variant="h3" weight="BOLD">
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  {description}
                </Typography>
              ) : null}
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Nhập lý do..."
                placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
                multiline
                maxLength={MAX_REASON_LENGTH}
              />
              <View style={styles.actions}>
                <Button title="Đóng" variant="outline" onPress={onClose} style={styles.action} />
                <Button
                  title={confirmTitle}
                  variant="danger"
                  disabled={trimmedReason.length === 0}
                  isLoading={isLoading}
                  onPress={() => onConfirm(trimmedReason)}
                  style={styles.action}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING_TOKENS.LG,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.LG,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  input: {
    minHeight: 96,
    padding: SPACING_TOKENS.MD,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  actions: { flexDirection: 'row', gap: SPACING_TOKENS.SM, marginTop: SPACING_TOKENS.SM },
  action: { flex: 1 },
});
