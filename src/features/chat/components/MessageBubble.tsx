import { memo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';
import { formatClockTime } from '../services/chatFormatters';
import type { DisplayMessage } from '../types';

export interface MessageBubbleProps {
  message: DisplayMessage;
  shouldShowTime: boolean;
  onLongPress: (message: DisplayMessage) => void;
  onRetry: (clientMessageId: string) => void;
  onDiscard: (clientMessageId: string) => void;
  onPressImage: (imageUrls: string[], index: number) => void;
}

const IMAGE_SIZE_SINGLE = 200;
const IMAGE_SIZE_GRID = 110;

const MessageBubbleComponent = ({
  message,
  shouldShowTime,
  onLongPress,
  onRetry,
  onDiscard,
  onPressImage,
}: MessageBubbleProps) => {
  const { isMine, deliveryState, isRecalled } = message;
  const isPending = deliveryState === 'queued' || deliveryState === 'sending';
  const isFailed = deliveryState === 'failed';
  const hasImages = message.imageUrls.length > 0;
  const isEdited = message.editedAt !== null && !isRecalled;
  const imageSize = message.imageUrls.length === 1 ? IMAGE_SIZE_SINGLE : IMAGE_SIZE_GRID;

  const textColor = isRecalled
    ? THEME_COLORS.TEXT_PLACEHOLDER
    : isMine && !isFailed
      ? THEME_COLORS.WHITE
      : THEME_COLORS.TEXT_PRIMARY;

  return (
    <View style={[styles.wrapper, isMine ? styles.mineWrapper : styles.theirsWrapper]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onLongPress(message)}
        disabled={isFailed || isPending}
        style={[
          styles.bubble,
          isMine ? styles.mineBubble : styles.theirsBubble,
          isRecalled && styles.recalledBubble,
          isPending && styles.pendingBubble,
          isFailed && styles.failedBubble,
        ]}
      >
        {hasImages && !isRecalled ? (
          <View style={styles.imageGrid}>
            {message.imageUrls.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                activeOpacity={0.9}
                onPress={() => onPressImage(message.imageUrls, index)}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: BORDER_RADIUS_TOKENS.MD,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {isRecalled || message.content ? (
          <Typography
            variant="body2"
            color={textColor}
            style={[styles.text, isRecalled && styles.recalledText]}
          >
            {isRecalled ? 'Tin nhắn đã được thu hồi' : (message.content ?? '')}
          </Typography>
        ) : null}
      </TouchableOpacity>

      {isFailed ? (
        <View style={styles.footer}>
          <AlertCircle size={12} color={THEME_COLORS.ERROR} />

          <Typography variant="tiny" weight="MEDIUM" colorKey="ERROR" style={styles.footerText}>
            Gửi không thành công
          </Typography>

          <TouchableOpacity onPress={() => onRetry(message.clientMessageId)} hitSlop={8}>
            <Typography variant="tiny" weight="BOLD" colorKey="PRIMARY_DARK">
              Thử lại
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDiscard(message.clientMessageId)}
            hitSlop={8}
            style={styles.discardButton}
          >
            <Typography variant="tiny" weight="BOLD" colorKey="TEXT_MUTED">
              Xoá
            </Typography>
          </TouchableOpacity>
        </View>
      ) : isPending ? (
        <View style={styles.footer}>
          <Typography variant="tiny" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            Đang chờ gửi
          </Typography>

          <Clock size={12} color={THEME_COLORS.TEXT_PLACEHOLDER} style={styles.footerIcon} />
        </View>
      ) : shouldShowTime || isEdited ? (
        <View style={styles.footer}>
          <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
            {isEdited
              ? `${formatClockTime(message.createdAt)} · đã chỉnh sửa`
              : formatClockTime(message.createdAt)}
          </Typography>

          {isMine && !isRecalled ? (
            message.readAt ? (
              <CheckCheck size={14} color={THEME_COLORS.PRIMARY} style={styles.footerIcon} />
            ) : (
              <Check size={14} color={THEME_COLORS.TEXT_PLACEHOLDER} style={styles.footerIcon} />
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '78%',
    marginBottom: SPACING_TOKENS.XS,
  },
  mineWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirsWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    paddingVertical: SPACING_TOKENS.SM + 2,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
    gap: SPACING_TOKENS.SM,
  },
  mineBubble: {
    backgroundColor: THEME_COLORS.PRIMARY,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.XS,
  },
  theirsBubble: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.XS,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.LG,
    shadowColor: THEME_COLORS.TEXT_PRIMARY,
    shadowOpacity: 0.06,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  recalledBubble: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    shadowOpacity: 0,
    elevation: 0,
  },
  pendingBubble: {
    opacity: 0.6,
  },
  failedBubble: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    borderWidth: 1,
    borderColor: THEME_COLORS.ERROR,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.XS,
  },
  text: {
    lineHeight: 21,
  },
  recalledText: {
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.SM,
  },
  footerText: {
    marginHorizontal: SPACING_TOKENS.XS,
  },
  footerIcon: {
    marginLeft: SPACING_TOKENS.XS,
  },
  discardButton: {
    marginLeft: SPACING_TOKENS.SM,
  },
});

const areBubblePropsEqual = (previous: MessageBubbleProps, next: MessageBubbleProps): boolean =>
  previous.shouldShowTime === next.shouldShowTime &&
  previous.onLongPress === next.onLongPress &&
  previous.onRetry === next.onRetry &&
  previous.onDiscard === next.onDiscard &&
  previous.onPressImage === next.onPressImage &&
  previous.message.key === next.message.key &&
  previous.message.deliveryState === next.message.deliveryState &&
  previous.message.readAt === next.message.readAt &&
  previous.message.isRecalled === next.message.isRecalled &&
  previous.message.editedAt === next.message.editedAt &&
  previous.message.content === next.message.content &&
  previous.message.errorMessage === next.message.errorMessage &&
  previous.message.imageUrls.length === next.message.imageUrls.length;

export const MessageBubble = memo(MessageBubbleComponent, areBubblePropsEqual);
