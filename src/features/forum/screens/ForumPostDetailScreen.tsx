import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EyeOff,
  Flag,
  Heart,
  MessageSquare,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import { HTTP_STATUS_CODES, USER_ROLES, type AppError } from '@core';
import { useAuth } from '@features/auth';
import type { RootStackParamList } from '@navigation';
import {
  ForumActionSheet,
  ForumAvatar,
  ForumCommentItem,
  ForumHeader,
  ForumPostHeaderBadge,
  ForumPostSkeleton,
  ForumReportSheet,
  RoommateInfoTable,
  type ForumActionItem,
  type ForumReportTarget,
} from '../components';
import {
  useCreateForumComment,
  useDeleteForumComment,
  useDeleteForumPost,
  useForumComments,
  useForumPost,
  useToggleForumLike,
} from '../hooks';
import type { ForumComment, ForumPost } from '../types';
import { formatRelativeTime } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, 'ForumPostDetail'>;

const ACTION_ICON_SIZE = 20;
const STAT_ICON_SIZE = 19;
const AUTHOR_AVATAR_SIZE = 44;
const COMPOSER_AVATAR_SIZE = 36;
const COMPOSER_CONTROL_SIZE = 42;

const orderCommentThreads = (comments: ForumComment[]) => {
  const repliesByParent = new Map<string, ForumComment[]>();

  for (const comment of comments) {
    if (!comment.parentId) continue;

    repliesByParent.set(comment.parentId, [
      ...(repliesByParent.get(comment.parentId) ?? []),
      comment,
    ]);
  }

  const rootIds = new Set(comments.filter((comment) => !comment.parentId).map((c) => c.id));
  const orphanReplies = comments.filter(
    (comment) => comment.parentId && !rootIds.has(comment.parentId)
  );

  return [
    ...comments
      .filter((comment) => !comment.parentId)
      .flatMap((root) => [root, ...(repliesByParent.get(root.id) ?? [])]),
    ...orphanReplies,
  ];
};

export const ForumPostDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<DetailRouteProp>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<ForumComment | null>(null);
  const [actionSheet, setActionSheet] = useState<ForumActionItem[] | null>(null);
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(null);

  const postQuery = useForumPost(params.postId);
  const commentsQuery = useForumComments(params.postId);
  const { mutate: toggleLike } = useToggleForumLike();
  const createCommentMutation = useCreateForumComment(params.postId);
  const { mutate: deleteComment } = useDeleteForumComment(params.postId);
  const deletePostMutation = useDeleteForumPost();

  const post = postQuery.data;
  const viewerId = user?.id;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const comments = useMemo(
    () => orderCommentThreads(commentsQuery.data?.pages.flatMap((page) => page.items) ?? []),
    [commentsQuery.data]
  );

  const handleDeletePost = (targetPost: ForumPost) => {
    Alert.alert('Xoá bài viết?', 'Bài viết và bình luận sẽ không còn hiển thị với mọi người.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () =>
          deletePostMutation.mutate(targetPost.id, {
            onSuccess: () => {
              toast.success('Đã xoá bài viết');
              navigation.goBack();
            },
            onError: (error) => toast.error(error.message, 'Không thể xoá bài viết'),
          }),
      },
    ]);
  };

  const handleOpenPostMenu = () => {
    if (!post) return;

    const actions: ForumActionItem[] = [];
    const isOwner = post.author.id === viewerId;

    if (isOwner || isAdmin) {
      actions.push(
        {
          key: 'edit',
          label: 'Chỉnh sửa bài viết',
          icon: <Pencil size={ACTION_ICON_SIZE} color={THEME_COLORS.TEXT_PRIMARY} />,
          onPress: () => navigation.navigate('ForumPostComposer', { postId: post.id }),
        },
        {
          key: 'delete',
          label: 'Xoá bài viết',
          icon: <Trash2 size={ACTION_ICON_SIZE} color={THEME_COLORS.ERROR} />,
          isDestructive: true,
          onPress: () => handleDeletePost(post),
        }
      );
    }

    if (!isOwner) {
      actions.push({
        key: 'report',
        label: 'Báo cáo bài viết',
        icon: <Flag size={ACTION_ICON_SIZE} color={THEME_COLORS.ERROR} />,
        isDestructive: true,
        onPress: () => setReportTarget({ entityType: 'forum_post', entityId: post.id }),
      });
    }

    setActionSheet(actions);
  };

  const handleOpenCommentMenu = useCallback(
    (comment: ForumComment) => {
      const actions: ForumActionItem[] = [];
      const isOwner = comment.author.id === viewerId;

      if (isOwner || isAdmin) {
        actions.push({
          key: 'delete',
          label: 'Xoá bình luận',
          icon: <Trash2 size={ACTION_ICON_SIZE} color={THEME_COLORS.ERROR} />,
          isDestructive: true,
          onPress: () =>
            deleteComment(comment.id, {
              onSuccess: () => toast.success('Đã xoá bình luận'),
              onError: (error) => toast.error(error.message, 'Không thể xoá bình luận'),
            }),
        });
      }

      if (!isOwner) {
        actions.push({
          key: 'report',
          label: 'Báo cáo bình luận',
          icon: <Flag size={ACTION_ICON_SIZE} color={THEME_COLORS.ERROR} />,
          isDestructive: true,
          onPress: () => setReportTarget({ entityType: 'forum_comment', entityId: comment.id }),
        });
      }

      setActionSheet(actions);
    },
    [deleteComment, isAdmin, toast, viewerId]
  );

  const handleReply = useCallback((comment: ForumComment) => {
    setReplyTarget(comment);
    inputRef.current?.focus();
  }, []);

  const submitComment = (hasAcknowledgedWarnings = false) => {
    const content = commentText.trim();

    if (!content) return;

    createCommentMutation.mutate(
      {
        content,
        parentId: replyTarget?.id,
        acknowledgeWarnings: hasAcknowledgedWarnings || undefined,
      },
      {
        onSuccess: () => {
          setCommentText('');
          setReplyTarget(null);
        },
        onError: (error: AppError) => {
          const needsConfirmation =
            error.statusCode === HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY &&
            /xác nhận/i.test(error.errorCode ?? '');

          if (needsConfirmation) {
            Alert.alert('Bình luận có nội dung cần lưu ý', error.message, [
              { text: 'Sửa lại', style: 'cancel' },
              { text: 'Vẫn gửi', onPress: () => submitComment(true) },
            ]);

            return;
          }

          toast.error(error.message, 'Không thể gửi bình luận');
        },
      }
    );
  };

  const handleToggleLike = () => {
    if (!post) return;

    toggleLike(
      { postId: post.id, isLiked: post.isLiked },
      { onError: (error) => toast.error(error.message, 'Không thể thả tim') }
    );
  };

  const renderPostHeader = () => {
    if (!post) return null;

    const authorMeta = [post.author.school, formatRelativeTime(post.publishedAt ?? post.createdAt)]
      .filter(Boolean)
      .join(' · ');

    return (
      <View>
        <View style={styles.postBlock}>
          {post.status !== 'published' ? (
            <View style={styles.statusBanner}>
              <EyeOff size={16} color={THEME_COLORS.WARNING} />
              <Typography variant="caption" colorKey="WARNING" style={styles.flexOne}>
                {post.status === 'draft'
                  ? 'Đây là bản nháp, chỉ bạn nhìn thấy.'
                  : 'Bài viết đang bị ẩn – chờ quản trị viên xử lý.'}
              </Typography>
            </View>
          ) : null}

          <View style={styles.authorRow}>
            <ForumAvatar
              name={post.author.fullName}
              seed={post.author.id}
              uri={post.author.avatarUrl}
              size={AUTHOR_AVATAR_SIZE}
            />

            <View style={styles.flexOne}>
              <Typography variant="body2" weight="SEMIBOLD" style={styles.authorName}>
                {post.author.fullName}
              </Typography>
              <Typography
                variant="caption"
                weight="MEDIUM"
                colorKey="TEXT_PLACEHOLDER"
                style={styles.authorMeta}
              >
                {authorMeta}
              </Typography>
            </View>

            <ForumPostHeaderBadge post={post} />
          </View>

          <Typography variant="h4" weight="SEMIBOLD" style={styles.postTitle}>
            {post.title}
          </Typography>

          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.postContent}>
            {post.content}
          </Typography>

          {post.roommate ? (
            <View style={styles.section}>
              <RoommateInfoTable roommate={post.roommate} mode="detail" />
            </View>
          ) : null}

          {post.imageUrls.length ? (
            <View style={[styles.section, styles.imageGrid]}>
              {post.imageUrls.map((url, index) => (
                <Image key={`${url}-${index}`} source={{ uri: url }} style={styles.gridImage} />
              ))}
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.stat}
              onPress={handleToggleLike}
              disabled={post.status !== 'published'}
              accessibilityLabel={post.isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
            >
              <Heart
                size={STAT_ICON_SIZE}
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
              <MessageSquare size={STAT_ICON_SIZE} color={THEME_COLORS.TEXT_PLACEHOLDER} />
              <Typography
                variant="body2"
                weight="MEDIUM"
                colorKey="TEXT_PLACEHOLDER"
                style={styles.statText}
              >
                {post.commentCount} bình luận
              </Typography>
            </View>

            <Typography
              variant="caption"
              weight="MEDIUM"
              colorKey="TEXT_PLACEHOLDER"
              style={styles.viewCount}
            >
              {post.viewCount} lượt xem
            </Typography>
          </View>
        </View>

        <Typography variant="h4" weight="BOLD" style={styles.commentsTitle}>
          Bình luận
        </Typography>
      </View>
    );
  };

  const renderContent = () => {
    if (postQuery.isLoading) {
      return <ForumPostSkeleton />;
    }

    if (postQuery.isError || !post) {
      return (
        <EmptyState
          title="Không tìm thấy bài viết"
          description={postQuery.error?.message ?? 'Bài viết có thể đã bị xoá hoặc đang bị ẩn.'}
          actionTitle="Quay lại"
          onAction={navigation.goBack}
        />
      );
    }

    return (
      <FlatList
        data={comments}
        keyExtractor={(comment) => comment.id}
        renderItem={({ item }) => (
          <ForumCommentItem
            comment={item}
            onReply={handleReply}
            onOpenMenu={handleOpenCommentMenu}
          />
        )}
        ListHeaderComponent={renderPostHeader()}
        ListEmptyComponent={
          commentsQuery.isLoading ? (
            <ActivityIndicator style={styles.loader} color={THEME_COLORS.PRIMARY} />
          ) : (
            <Typography
              variant="body2"
              colorKey="TEXT_MUTED"
              align="center"
              style={styles.noComment}
            >
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </Typography>
          )
        }
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.loader} color={THEME_COLORS.PRIMARY} />
          ) : null
        }
        onEndReached={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            void commentsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  const canComment = post?.status === 'published';

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <ForumHeader
        title="Bài viết"
        hasBottomBorder
        onBack={navigation.goBack}
        rightAction={
          post ? (
            <TouchableOpacity
              onPress={handleOpenPostMenu}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Tuỳ chọn bài viết"
            >
              <MoreVertical size={20} color={THEME_COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flexOne}>{renderContent()}</View>

        {canComment ? (
          <View style={[styles.composer, { paddingBottom: insets.bottom + SPACING_TOKENS.SM }]}>
            {replyTarget ? (
              <View style={styles.replyBar}>
                <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.flexOne}>
                  Đang trả lời{' '}
                  <Typography variant="caption" weight="SEMIBOLD">
                    {replyTarget.author.fullName}
                  </Typography>
                </Typography>
                <TouchableOpacity onPress={() => setReplyTarget(null)}>
                  <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY">
                    Huỷ
                  </Typography>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.composerRow}>
              <ForumAvatar
                name={user?.fullName ?? 'Bạn'}
                seed={user?.id ?? 'me'}
                uri={user?.avatarUrl}
                size={COMPOSER_AVATAR_SIZE}
                style={styles.composerAvatar}
              />

              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Viết bình luận…"
                placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={[styles.sendButton, commentText.trim() && styles.sendButtonActive]}
                onPress={() => submitComment()}
                disabled={!commentText.trim() || createCommentMutation.isPending}
                accessibilityLabel="Gửi bình luận"
              >
                {createCommentMutation.isPending ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.WHITE} />
                ) : (
                  <Send
                    size={20}
                    color={commentText.trim() ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PLACEHOLDER}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <ForumActionSheet
        isVisible={Boolean(actionSheet?.length)}
        actions={actionSheet ?? []}
        onClose={() => setActionSheet(null)}
      />

      <ForumReportSheet target={reportTarget} onClose={() => setReportTarget(null)} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING_TOKENS.LG,
  },
  postBlock: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: SPACING_TOKENS.SM,
    borderBottomColor: THEME_COLORS.BACKGROUND,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM + 4,
    marginBottom: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 2,
  },
  authorName: {
    lineHeight: 22,
  },
  authorMeta: {
    letterSpacing: 0.2,
  },
  postTitle: {
    marginTop: SPACING_TOKENS.SM + 4,
    fontSize: 17,
    lineHeight: 25,
  },
  postContent: {
    marginTop: SPACING_TOKENS.SM + 4,
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginTop: SPACING_TOKENS.SM + 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING_TOKENS.SM,
  },
  gridImage: {
    width: '48.5%',
    height: 110,
    borderRadius: BORDER_RADIUS_TOKENS.SM + 2,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  statsRow: {
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
  viewCount: {
    marginLeft: 'auto',
  },
  commentsTitle: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XS,
  },
  loader: {
    paddingVertical: SPACING_TOKENS.LG,
  },
  noComment: {
    paddingVertical: SPACING_TOKENS.LG,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingTop: SPACING_TOKENS.SM + 2,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.SM,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING_TOKENS.SM + 2,
  },
  composerAvatar: {
    marginBottom: (COMPOSER_CONTROL_SIZE - COMPOSER_AVATAR_SIZE) / 2,
  },
  commentInput: {
    flex: 1,
    minHeight: COMPOSER_CONTROL_SIZE,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: BORDER_RADIUS_TOKENS.XL + 1,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 21,
  },
  sendButton: {
    width: COMPOSER_CONTROL_SIZE,
    height: COMPOSER_CONTROL_SIZE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.BORDER,
  },
  sendButtonActive: {
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
