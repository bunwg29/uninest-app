import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { useForumReplies } from '../hooks';
import type { ForumComment } from '../types';
import { ForumCommentItem } from './ForumCommentItem';

interface ForumCommentThreadProps {
  comment: ForumComment;
  onReply: (comment: ForumComment) => void;
  onOpenMenu: (comment: ForumComment) => void;
}

const ForumCommentThreadComponent = ({ comment, onReply, onOpenMenu }: ForumCommentThreadProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const repliesQuery = useForumReplies(comment.postId, comment.id, isExpanded);
  const preview = comment.replies ?? [];
  const loadedReplies = repliesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const replies = isExpanded && loadedReplies.length > 0 ? loadedReplies : preview;
  const replyCount = comment.replyCount ?? preview.length;
  const remaining = Math.max(replyCount - replies.length, 0);
  const canLoadMore = isExpanded ? Boolean(repliesQuery.hasNextPage) : remaining > 0;

  const handleLoadMore = () => {
    if (!isExpanded) {
      setIsExpanded(true);

      return;
    }

    if (!repliesQuery.isFetchingNextPage) void repliesQuery.fetchNextPage();
  };

  return (
    <View>
      <ForumCommentItem comment={comment} onReply={onReply} onOpenMenu={onOpenMenu} />

      {replies.map((reply) => (
        <ForumCommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onOpenMenu={onOpenMenu}
        />
      ))}

      {canLoadMore ? (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={handleLoadMore}
          disabled={repliesQuery.isFetching}
          accessibilityRole="button"
        >
          {repliesQuery.isFetching ? (
            <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
          ) : (
            <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY">
              {`Xem thêm ${remaining} phản hồi`}
            </Typography>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const ForumCommentThread = memo(ForumCommentThreadComponent);

const styles = StyleSheet.create({
  moreButton: {
    alignSelf: 'flex-start',
    marginLeft: 46,
    paddingVertical: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.SM,
  },
});
