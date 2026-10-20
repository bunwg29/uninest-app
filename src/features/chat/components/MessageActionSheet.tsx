import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Copy, Trash2 } from 'lucide-react-native';
import {
  THEME_COLORS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
import { BottomSheet, Typography } from '@ui';

export interface MessageActionSheetProps {
  isVisible: boolean;
  canCopy: boolean;
  canRecall: boolean;
  onClose: () => void;
  onCopy: () => void;
  onRecall: () => void;
}

const ACTION_ICON_SIZE = 21;

export const MessageActionSheet = ({
  isVisible,
  canCopy,
  canRecall,
  onClose,
  onCopy,
  onRecall,
}: MessageActionSheetProps) => {
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropColor={OVERLAY_COLORS.MODAL_BACKDROP}
      sheetStyle={styles.sheet}
      handleStyle={styles.handle}
    >
      {canCopy ? (
        <TouchableOpacity style={styles.action} onPress={onCopy} activeOpacity={0.7}>
          <Copy size={ACTION_ICON_SIZE} color={THEME_COLORS.TEXT_SECONDARY} />

          <Typography variant="body1" style={styles.actionLabel}>
            Sao chép
          </Typography>
        </TouchableOpacity>
      ) : null}

      {canCopy && canRecall ? <View style={styles.divider} /> : null}

      {canRecall ? (
        <TouchableOpacity style={styles.action} onPress={onRecall} activeOpacity={0.7}>
          <Trash2 size={ACTION_ICON_SIZE} color={THEME_COLORS.ERROR} />

          <Typography variant="body1" colorKey="ERROR" style={styles.actionLabel}>
            Thu hồi với mọi người
          </Typography>
        </TouchableOpacity>
      ) : null}

      <View style={styles.notice}>
        <Clock size={17} color={THEME_COLORS.WARNING} />

        <Typography variant="body2" color={THEME_COLORS.WARNING} style={styles.noticeText}>
          Chỉ thu hồi được tin nhắn của bạn, trong vòng 24 giờ sau khi gửi.
        </Typography>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
        <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_SECONDARY">
          Huỷ
        </Typography>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    paddingTop: SPACING_TOKENS.SM + 2,
  },
  handle: {
    marginBottom: SPACING_TOKENS.MD - 2,
  },
  action: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SPACING_TOKENS.MD + 4,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  divider: {
    height: 1,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD - 2,
    paddingTop: 11,
    paddingBottom: 13,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  noticeText: {
    flex: 1,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
  },
  cancelButton: {
    height: 52,
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
