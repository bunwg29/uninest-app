import { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, CheckCheck, Clock } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Typography } from '@ui';
import { ImageCollage } from './ImageCollage';
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
  const hasImages = message.imageUrls.length > 0 && !isRecalled;
  const hasTextBubble = isRecalled || Boolean(message.content);
  const isInteractive = !isFailed && !isPending;

  const textColor = isRecalled
    ? THEME_COLORS.TEXT_PLACEHOLDER
    : isMine && !isFailed
      ? THEME_COLORS.WHITE
      : THEME_COLORS.TEXT_PRIMARY;

  return (
    <View style={[styles.wrapper, isMine ? styles.mineWrapper : styles.theirsWrapper]}>
      {hasImages ? (
        <ImageCollage
          imageUrls={message.imageUrls}
          onPressImage={(index) => onPressImage(message.imageUrls, index)}
          onLongPress={isInteractive ? () => onLongPress(message) : undefined}
          style={[isPending && styles.pendingMedia, isFailed && styles.failedMedia]}
        />
      ) : null}

      {hasTextBubble ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => onLongPress(message)}
          disabled={!isInteractive}
          style={[
            styles.bubble,
            hasImages && styles.captionBubble,
            isMine ? styles.mineBubble : styles.theirsBubble,
            isRecalled && styles.recalledBubble,
            isPending && styles.pendingBubble,
            isFailed && styles.failedBubble,
          ]}
        >
          <Typography
            variant="body2"
            color={textColor}
            style={[styles.text, isRecalled && styles.recalledText]}
          >
            {isRecalled ? 'Tin nhắn đã được thu hồi' : (message.content ?? '')}
          </Typography>
        </TouchableOpacity>
      ) : null}

      {isFailed ? (
        <View style={styles.footer}>
          <AlertCircle size={14} color={THEME_COLORS.ERROR} />

          <Typography
            variant="tiny"
            weight="REGULAR"
            colorKey="ERROR"
            style={[styles.footerLabel, styles.footerText]}
          >
            Gửi không thành công
          </Typography>

          <TouchableOpacity onPress={() => onRetry(message.clientMessageId)} hitSlop={8}>
            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              colorKey="PRIMARY_DARK"
              style={styles.footerLabel}
            >
              Thử lại
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDiscard(message.clientMessageId)}
            hitSlop={8}
            style={styles.discardButton}
          >
            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              colorKey="TEXT_MUTED"
              style={styles.footerLabel}
            >
              Xoá
            </Typography>
          </TouchableOpacity>
        </View>
      ) : isPending ? (
        <View style={styles.footer}>
          <Typography
            variant="tiny"
            weight="REGULAR"
            color={OVERLAY_COLORS.STEP_PENDING_TEXT}
            style={styles.footerLabel}
          >
            Đang chờ gửi
          </Typography>

          <Clock size={14} color={OVERLAY_COLORS.STEP_PENDING_TEXT} style={styles.footerIcon} />
        </View>
      ) : shouldShowTime ? (
        <View style={styles.footer}>
          <Typography
            variant="tiny"
            weight="REGULAR"
            color={OVERLAY_COLORS.STEP_PENDING_TEXT}
            style={styles.footerLabel}
          >
            {formatClockTime(message.createdAt)}
          </Typography>

          {isMine && !isRecalled ? (
            message.readAt ? (
              <CheckCheck size={15} color={THEME_COLORS.PRIMARY} style={styles.footerIcon} />
            ) : (
              <CheckCheck
                size={15}
                color={OVERLAY_COLORS.STEP_PENDING_TEXT}
                style={styles.footerIcon}
              />
            )
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '76.5%',
    marginBottom: SPACING_TOKENS.SM + 2,
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
    borderColor: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
  },
  captionBubble: {
    marginTop: SPACING_TOKENS.XS,
  },
  pendingMedia: {
    opacity: 0.6,
  },
  failedMedia: {
    borderWidth: 1,
    borderColor: THEME_COLORS.ERROR,
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
    marginTop: SPACING_TOKENS.SM + 2,
  },
  footerLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  footerText: {
    marginHorizontal: SPACING_TOKENS.XS + 2,
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
  previous.message.content === next.message.content &&
  previous.message.errorMessage === next.message.errorMessage &&
  previous.message.imageUrls.length === next.message.imageUrls.length &&
  previous.message.imageUrls[0] === next.message.imageUrls[0];

export const MessageBubble = memo(MessageBubbleComponent, areBubblePropsEqual);
