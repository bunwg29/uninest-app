import { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCheck, Image as ImageIcon } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { GradientAvatar, Typography } from '@ui';
import { formatConversationTime, getLastMessagePreview } from '../services/chatFormatters';
import type { Conversation } from '../types';

export interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: (conversation: Conversation) => void;
  onLongPress: (conversation: Conversation) => void;
}

const ConversationListItemComponent = ({
  conversation,
  currentUserId,
  onPress,
  onLongPress,
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
      onLongPress={() => onLongPress(conversation)}
      activeOpacity={0.8}
    >
      <GradientAvatar
        uri={counterpart.avatarUrl}
        name={counterpart.fullName}
        seed={counterpart.id}
        size={56}
        isOnline={counterpart.isOnline}
      />

      <View style={styles.body}>
        <Typography
          variant="body2"
          weight="SEMIBOLD"
          colorKey="TEXT_PRIMARY"
          numberOfLines={1}
          style={styles.name}
        >
          {counterpart.fullName}
        </Typography>

        <Typography
          variant="caption"
          weight="MEDIUM"
          color={isUnread ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_PLACEHOLDER}
          numberOfLines={1}
          style={styles.listingTitle}
        >
          {listing.title}
        </Typography>

        <View style={styles.previewRow}>
          {isImageOnly ? (
            <ImageIcon size={14} color={THEME_COLORS.TEXT_MUTED} style={styles.previewIcon} />
          ) : null}

          {isMine && lastMessage ? (
            <CheckCheck
              size={15}
              color={lastMessage.readAt ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              style={styles.previewIcon}
            />
          ) : null}

          <Typography
            variant="body2"
            weight={isUnread ? 'MEDIUM' : 'REGULAR'}
            color={isUnread ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_MUTED}
            numberOfLines={2}
            style={styles.previewText}
          >
            {lastMessage ? getLastMessagePreview(lastMessage) : ''}
          </Typography>
        </View>
      </View>

      <View style={styles.meta}>
        {conversation.lastMessageAt ? (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.time}
          >
            {formatConversationTime(conversation.lastMessageAt)}
          </Typography>
        ) : null}

        {isUnread ? (
          <View style={styles.unreadBadge}>
            <Typography variant="caption" weight="BOLD" colorKey="WHITE" style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Typography>
          </View>
        ) : null}
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
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: 12,
  },
  unreadContainer: {
    backgroundColor: OVERLAY_COLORS.UNREAD_ROW,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  name: {
    lineHeight: 22,
  },
  listingTitle: {
    letterSpacing: 0.2,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewIcon: {
    marginTop: 3,
    marginRight: 6,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5,
  },
  time: {
    letterSpacing: 0.2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
  },
  unreadText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
