import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { ForumComment } from '../types';
import { formatRelativeTime } from '../utils';
import { ForumAvatar } from './ForumAvatar';

export interface ForumCommentItemProps {
  comment: ForumComment;
  onReply: (comment: ForumComment) => void;
  onOpenMenu: (comment: ForumComment) => void;
}

const ForumCommentItemComponent = ({ comment, onReply, onOpenMenu }: ForumCommentItemProps) => {
  const isReply = Boolean(comment.parentId);
  const isHidden = comment.status === 'hidden';

  return (
    <View style={[styles.container, isReply && styles.reply]}>
      <ForumAvatar
        name={comment.author.fullName}
        seed={comment.author.id}
        uri={comment.author.avatarUrl}
        size={isReply ? 28 : 34}
      />

      <View style={styles.body}>
        <View style={styles.bubble}>
          <Typography variant="label" weight="SEMIBOLD">
            {comment.author.fullName}
          </Typography>

          <Typography variant="body2" colorKey="TEXT_SECONDARY">
            {comment.content}
          </Typography>
        </View>

        <View style={styles.meta}>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {formatRelativeTime(comment.createdAt)}
          </Typography>

          {isHidden ? (
            <Typography variant="caption" colorKey="WARNING">
              Đang ẩn – chờ quản trị viên xử lý
            </Typography>
          ) : (
            <TouchableOpacity onPress={() => onReply(comment)}>
              <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                Trả lời
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onOpenMenu(comment)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Tuỳ chọn bình luận"
      >
        <MoreHorizontal size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      </TouchableOpacity>
    </View>
  );
};

export const ForumCommentItem = memo(ForumCommentItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
  },
  reply: {
    paddingLeft: SPACING_TOKENS.MD + 40,
  },
  body: {
    flex: 1,
  },
  bubble: {
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingVertical: SPACING_TOKENS.SM,
  },
  meta: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.XS,
    marginLeft: SPACING_TOKENS.SM,
  },
});
