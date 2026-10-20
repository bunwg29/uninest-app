import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Eye, Heart, MessageSquare } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { ForumPost } from '../types';
import { FORUM_CATEGORY_OPTIONS } from '../types';
import { formatRelativeTime } from '../utils';
import { ForumAvatar } from './ForumAvatar';
import { ForumBadge } from './ForumBadge';
import { ForumImageStrip } from './ForumImageStrip';
import { RoommateInfoTable } from './RoommateInfoTable';

export interface ForumPostCardProps {
  post: ForumPost;
  isRoommateFeed?: boolean;
  onPress: (post: ForumPost) => void;
  onToggleLike: (post: ForumPost) => void;
}

export const ForumPostHeaderBadge = ({
  post,
  isRoommateFeed,
}: {
  post: ForumPost;
  isRoommateFeed?: boolean;
}) => {
  if (isRoommateFeed && post.roommateStatus) {
    return (
      <ForumBadge
        tone={post.roommateStatus === 'open' ? 'success' : 'neutral'}
        label={post.roommateStatusLabel ?? ''}
      />
    );
  }

  const categoryOption = FORUM_CATEGORY_OPTIONS.find((option) => option.value === post.category);

  return <ForumBadge tone="primary" label={categoryOption?.shortLabel ?? ''} />;
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
  const iconSize = isRoommateFeed ? 18 : 19;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress(post)}>
      <View style={styles.header}>
        <ForumAvatar
          name={post.author.fullName}
          seed={post.author.id}
          uri={post.author.avatarUrl}
        />

        <View style={styles.authorInfo}>
          <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1} style={styles.authorName}>
            {post.author.fullName}
          </Typography>

          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={2}
            style={styles.authorMeta}
          >
            {authorMeta}
          </Typography>
        </View>

        <ForumPostHeaderBadge post={post} isRoommateFeed={isRoommateFeed} />
      </View>

      <Typography variant="h4" weight="SEMIBOLD" style={styles.title} numberOfLines={3}>
        {post.title}
      </Typography>

      {!isRoommateFeed ? (
        <Typography
          variant="body2"
          colorKey="TEXT_SECONDARY"
          numberOfLines={post.roommate ? 3 : 4}
          style={styles.content}
        >
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
        <View style={styles.imageSection}>
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
            size={iconSize}
            color={post.isLiked ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_PLACEHOLDER}
            fill={post.isLiked ? THEME_COLORS.ERROR : THEME_COLORS.TRANSPARENT}
          />
          <Typography
            variant="body2"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.statText}
          >
            {post.likeCount}
          </Typography>
        </TouchableOpacity>

        <View style={styles.stat}>
          {!isRoommateFeed ? (
            <MessageSquare size={iconSize} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          ) : null}
          <Typography
            variant="body2"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.statText}
          >
            {post.commentCount} bình luận
          </Typography>
        </View>

        {!isRoommateFeed ? (
          <View style={styles.stat}>
            <Eye size={iconSize} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            <Typography
              variant="body2"
              weight="MEDIUM"
              colorKey="TEXT_PLACEHOLDER"
              style={styles.statText}
            >
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
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 2,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    lineHeight: 22,
  },
  authorMeta: {
    letterSpacing: 0.2,
  },
  title: {
    marginTop: SPACING_TOKENS.SM + 4,
    lineHeight: 23,
  },
  content: {
    marginTop: SPACING_TOKENS.SM,
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginTop: SPACING_TOKENS.SM + 4,
  },
  imageSection: {
    marginTop: SPACING_TOKENS.SM + 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: SPACING_TOKENS.SM + 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
