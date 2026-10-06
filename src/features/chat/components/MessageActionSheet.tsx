import { Modal, View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Clock, Copy, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography } from '@ui';

export interface MessageActionSheetProps {
  isVisible: boolean;
  canCopy: boolean;
  canRecall: boolean;
  onClose: () => void;
  onCopy: () => void;
  onRecall: () => void;
}

export const MessageActionSheet = ({
  isVisible,
  canCopy,
  canRecall,
  onClose,
  onCopy,
  onRecall,
}: MessageActionSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}>
        <View style={styles.handle} />

        {canCopy ? (
          <TouchableOpacity style={styles.action} onPress={onCopy} activeOpacity={0.7}>
            <Copy size={20} color={THEME_COLORS.TEXT_SECONDARY} />

            <Typography variant="body1" weight="MEDIUM">
              Sao chép
            </Typography>
          </TouchableOpacity>
        ) : null}

        {canRecall ? (
          <TouchableOpacity style={styles.action} onPress={onRecall} activeOpacity={0.7}>
            <Trash2 size={20} color={THEME_COLORS.ERROR} />

            <Typography variant="body1" weight="MEDIUM" colorKey="ERROR">
              Thu hồi với mọi người
            </Typography>
          </TouchableOpacity>
        ) : null}

        <View style={styles.notice}>
          <Clock size={16} color={THEME_COLORS.WARNING} />

          <Typography variant="body2" color={THEME_COLORS.WARNING} style={styles.noticeText}>
            Bạn chỉ có thể thu hồi tin nhắn của chính mình.
          </Typography>
        </View>

        <Button title="Huỷ" variant="outline" fullWidth onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 27, 34, 0.45)',
  },
  sheet: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.SM,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD - 4,
    paddingVertical: SPACING_TOKENS.MD - 2,
    paddingHorizontal: SPACING_TOKENS.XS,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
    marginVertical: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.SECONDARY,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  noticeText: {
    flex: 1,
  },
});
