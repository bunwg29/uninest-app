import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { X } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS, OVERLAY_COLORS } from '@theme';
import { Typography } from '../atoms/Typography';
import { Button, ButtonVariant } from '../atoms/Button';

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
  confirmVariant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  dismissible?: boolean;
}

export const Modal = ({
  isVisible,
  onClose,
  title,
  description,
  children,
  confirmText,
  cancelText,
  onConfirm,
  isConfirmLoading = false,
  confirmVariant = 'primary',
  style,
  dismissible = true,
}: ModalProps) => {
  const handleBackdropPress = () => {
    if (dismissible) {
      onClose();
    }
  };

  const resolvedConfirmText = confirmText || (onConfirm ? 'Xác nhận' : undefined);
  const resolvedCancelText = cancelText || (onConfirm ? 'Hủy' : undefined);

  return (
    <RNModal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, style]}>
              <View style={styles.header}>
                <Typography variant="h3" weight="BOLD" colorKey="TEXT_PRIMARY" style={styles.title}>
                  {title || ''}
                </Typography>

                {dismissible ? (
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={20} color={THEME_COLORS.TEXT_MUTED} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {description ? (
                <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.description}>
                  {description}
                </Typography>
              ) : null}

              {children ? <View style={styles.body}>{children}</View> : null}

              {onConfirm || cancelText ? (
                <View style={styles.footer}>
                  {resolvedCancelText ? (
                    <Button
                      title={resolvedCancelText}
                      variant="outline"
                      size="md"
                      onPress={onClose}
                      style={styles.actionButton}
                      disabled={isConfirmLoading}
                    />
                  ) : null}

                  {onConfirm && resolvedConfirmText ? (
                    <Button
                      title={resolvedConfirmText}
                      variant={confirmVariant}
                      size="md"
                      isLoading={isConfirmLoading}
                      onPress={onConfirm}
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: OVERLAY_COLORS.IMAGE_MORE_SCRIM,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING_TOKENS.LG,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.LG,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.SM,
  },
  title: {
    flex: 1,
  },
  description: {
    marginBottom: SPACING_TOKENS.MD,
  },
  body: {
    marginBottom: SPACING_TOKENS.MD,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.SM,
  },
  actionButton: {
    flex: 1,
  },
});
