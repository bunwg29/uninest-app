import { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCheck, Image as ImageIcon } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, TYPOGRAPHY_TOKENS } from '@theme';
import { Avatar, Badge, Typography } from '@ui';
import { formatConversationTime, getLastMessagePreview } from '../services/chatFormatters';
import type { Conversation } from '../types';

const UNREAD_ROW_BACKGROUND = 'rgba(29, 83, 204, 0.04)';

export interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversation: Conversation) => void;
}

const ConversationListItemComponent = ({
  conversation,
  currentUserId,
  onPress,
}: ConversationListItemProps) => {
  const { counterpart, listing, lastMessage, unreadCount } = conversation;
  const isUnread = unreadCount > 0;
  const isMine = lastMessage?.senderId === currentUserId;
  const isImageOnly =
    lastMessage?.type === 'image' && !lastMessage.content && !lastMessage.isRecalled;

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={() => onPress(conversation)}
      activeOpacity={0.8}
    >
      <Avatar
        uri={counterpart.avatarUrl}
        name={counterpart.fullName}
        size="lg"
        isOnline={counterpart.isOnline}
      />

      <View style={styles.body}>
        <View style={styles.row}>
          <Typography
            variant="body2"
            weight="SEMIBOLD"
            colorKey="TEXT_PRIMARY"
            numberOfLines={1}
            style={styles.flexOne}
          >
            {counterpart.fullName}
          </Typography>

          {conversation.lastMessageAt ? (
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              {formatConversationTime(conversation.lastMessageAt)}
            </Typography>
          ) : null}
        </View>

        <Typography
          variant="caption"
          weight="MEDIUM"
          color={isUnread ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_PLACEHOLDER}
          numberOfLines={1}
        >
          {listing.title}
        </Typography>

        <View style={styles.row}>
          <View style={[styles.previewRow, styles.flexOne]}>
            {isImageOnly ? (
              <ImageIcon size={14} color={THEME_COLORS.TEXT_MUTED} style={styles.previewIcon} />
            ) : null}

            {isMine && lastMessage ? (
              <CheckCheck
                size={14}
                color={lastMessage.readAt ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
                style={styles.previewIcon}
              />
            ) : null}

            <Typography
              variant="body2"
              weight={isUnread ? 'MEDIUM' : 'REGULAR'}
              color={isUnread ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_MUTED}
              numberOfLines={2}
              style={[styles.flexOne, styles.previewText]}
            >
              {lastMessage ? getLastMessagePreview(lastMessage) : ''}
            </Typography>
          </View>

          {isUnread ? (
            <Badge label={unreadCount > 99 ? '99+' : unreadCount} variant="counter" />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ConversationListItem = memo(ConversationListItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD - 4,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
    gap: SPACING_TOKENS.MD - 4,
  },
  unreadContainer: {
    backgroundColor: UNREAD_ROW_BACKGROUND,
  },
  previewText: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.SUB,
  },
  body: {
    flex: 1,
    gap: SPACING_TOKENS.XXS,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    marginRight: SPACING_TOKENS.XS,
  },
  flexOne: {
    flex: 1,
  },
});
