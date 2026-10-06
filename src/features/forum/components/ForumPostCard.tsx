import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Eye, Heart, MessageSquare } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Badge, Typography } from '@ui';
import type { ForumPost } from '../types';
import { FORUM_CATEGORY_OPTIONS } from '../types';
import { formatRelativeTime } from '../utils';
import { ForumAvatar } from './ForumAvatar';
import { ForumImageStrip } from './ForumImageStrip';
import { RoommateInfoTable } from './RoommateInfoTable';

export interface ForumPostCardProps {
  post: ForumPost;
  isRoommateFeed?: boolean;
  onPress: (post: ForumPost) => void;
  onToggleLike: (post: ForumPost) => void;
}

const ICON_SIZE = 18;

export const ForumPostHeaderBadge = ({
  post,
  isRoommateFeed,
}: {
  post: ForumPost;
  isRoommateFeed?: boolean;
}) => {
  if (isRoommateFeed && post.roommateStatus) {
    return (
      <Badge
        size="sm"
        variant={post.roommateStatus === 'open' ? 'available' : 'neutral'}
        label={(post.roommateStatusLabel ?? '').toUpperCase()}
      />
    );
  }

  const categoryOption = FORUM_CATEGORY_OPTIONS.find((option) => option.value === post.category);

  return <Badge size="sm" variant="primary" label={categoryOption?.shortLabel ?? ''} />;
};

const ForumPostCardComponent = ({
  post,
  isRoommateFeed = false,
  onPress,
  onToggleLike,
}: ForumPostCardProps) => {
  const authorMeta = [post.author.school, formatRelativeTime(post.publishedAt ?? post.createdAt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress(post)}>
      <View style={styles.header}>
        <ForumAvatar
          name={post.author.fullName}
          seed={post.author.id}
          uri={post.author.avatarUrl}
        />

        <View style={styles.authorInfo}>
          <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
            {post.author.fullName}
          </Typography>

          <Typography variant="caption" colorKey="TEXT_MUTED" numberOfLines={2}>
            {authorMeta}
          </Typography>
        </View>

        <ForumPostHeaderBadge post={post} isRoommateFeed={isRoommateFeed} />
      </View>

      <Typography variant="h4" weight="BOLD" style={styles.title} numberOfLines={3}>
        {post.title}
      </Typography>

      {!isRoommateFeed ? (
        <Typography variant="body2" colorKey="TEXT_SECONDARY" numberOfLines={3}>
          {post.content}
        </Typography>
      ) : null}

      {post.roommate ? (
        <View style={styles.section}>
          <RoommateInfoTable
            roommate={post.roommate}
            mode={isRoommateFeed ? 'roommate-feed' : 'feed'}
          />
        </View>
      ) : null}

      {post.imageUrls.length && !post.roommate ? (
        <View style={styles.section}>
          <ForumImageStrip imageUrls={post.imageUrls} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.stat}
          onPress={() => onToggleLike(post)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={post.isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
        >
          <Heart
            size={ICON_SIZE}
            color={post.isLiked ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_MUTED}
            fill={post.isLiked ? THEME_COLORS.ERROR : THEME_COLORS.TRANSPARENT}
          />
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {post.likeCount}
          </Typography>
        </TouchableOpacity>

        <View style={styles.stat}>
          {!isRoommateFeed ? (
            <MessageSquare size={ICON_SIZE} color={THEME_COLORS.TEXT_MUTED} />
          ) : null}
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {post.commentCount} bình luận
          </Typography>
        </View>

        {!isRoommateFeed ? (
          <View style={styles.stat}>
            <Eye size={ICON_SIZE} color={THEME_COLORS.TEXT_MUTED} />
            <Typography variant="caption" colorKey="TEXT_MUTED">
              {post.viewCount}
            </Typography>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export const ForumPostCard = memo(ForumPostCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    padding: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 4,
  },
  authorInfo: {
    flex: 1,
  },
  title: {
    marginTop: SPACING_TOKENS.SM + 4,
    marginBottom: SPACING_TOKENS.XS + 2,
  },
  section: {
    marginTop: SPACING_TOKENS.SM + 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.LG,
    marginTop: SPACING_TOKENS.MD,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS + 2,
  },
});
