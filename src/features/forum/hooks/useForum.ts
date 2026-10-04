import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AppError, PaginatedResponse } from '@core';
import { useAuth } from '@features/auth';
import { forumService } from '../services';
import type {
  CreateForumCommentPayload,
  ForumComment,
  ForumFeedFilters,
  ForumLocalImage,
  ForumPost,
  ForumReportPayload,
  SaveForumPostPayload,
} from '../types';
import { FORUM_FEED_STALE_TIME_MS, FORUM_QUERY_KEYS } from '../types';

type ForumFeedCache = InfiniteData<PaginatedResponse<ForumPost>>;

const ANONYMOUS_VIEWER_ID = 'anonymous';

const getNextPage = <T>(lastPage: PaginatedResponse<T>) =>
  lastPage.hasMore ? lastPage.page + 1 : undefined;

// isOwner/canManage/isLiked phụ thuộc người xem, nên cache phải tách theo tài khoản
// để khi đổi tài khoản trên cùng thiết bị không hiển thị quyền của người trước.
const useForumViewerId = () => useAuth().user?.id ?? ANONYMOUS_VIEWER_ID;

export const useForumFeed = (filters: ForumFeedFilters) => {
  const viewerId = useForumViewerId();

  return useInfiniteQuery({
    queryKey: [...FORUM_QUERY_KEYS.FEEDS(viewerId), filters],
    queryFn: ({ pageParam }) => forumService.getFeed(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    staleTime: FORUM_FEED_STALE_TIME_MS,
  });
};

export const useForumPost = (postId: string) => {
  const viewerId = useForumViewerId();

  return useQuery({
    queryKey: FORUM_QUERY_KEYS.POST(viewerId, postId),
    queryFn: () => forumService.getPost(postId),
    enabled: Boolean(postId),
    staleTime: FORUM_FEED_STALE_TIME_MS,
  });
};

export const useForumComments = (postId: string) => {
  const viewerId = useForumViewerId();

  return useInfiniteQuery({
    queryKey: FORUM_QUERY_KEYS.COMMENTS(viewerId, postId),
    queryFn: ({ pageParam }) => forumService.getComments(postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    enabled: Boolean(postId),
    staleTime: FORUM_FEED_STALE_TIME_MS,
  });
};

const useForumCache = () => {
  const queryClient = useQueryClient();
  const viewerId = useForumViewerId();

  const patchPost = (postId: string, patch: (post: ForumPost) => ForumPost) => {
    queryClient.setQueriesData<ForumFeedCache>(
      { queryKey: FORUM_QUERY_KEYS.FEEDS(viewerId) },
      (cache) =>
        cache
          ? {
              ...cache,
              pages: cache.pages.map((page) => ({
                ...page,
                items: page.items.map((post) => (post.id === postId ? patch(post) : post)),
              })),
            }
          : cache
    );
    queryClient.setQueryData<ForumPost>(FORUM_QUERY_KEYS.POST(viewerId, postId), (post) =>
      post ? patch(post) : post
    );
  };

  return { queryClient, viewerId, patchPost };
};

export const useToggleForumLike = () => {
  const { queryClient, viewerId, patchPost } = useForumCache();

  return useMutation<
    Awaited<ReturnType<typeof forumService.likePost>>,
    AppError,
    { postId: string; isLiked: boolean }
  >({
    mutationFn: ({ postId, isLiked }) =>
      isLiked ? forumService.unlikePost(postId) : forumService.likePost(postId),
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: FORUM_QUERY_KEYS.VIEWER(viewerId) });

      patchPost(postId, (post) => ({
        ...post,
        isLiked: !isLiked,
        likeCount: Math.max(0, post.likeCount + (isLiked ? -1 : 1)),
      }));
    },
    onError: (_error, { postId, isLiked }) => {
      patchPost(postId, (post) => ({
        ...post,
        isLiked,
        likeCount: Math.max(0, post.likeCount + (isLiked ? 1 : -1)),
      }));
    },
    onSuccess: (result) => {
      patchPost(result.postId, (post) => ({
        ...post,
        isLiked: result.isLiked,
        likeCount: result.likeCount,
      }));
    },
  });
};

export const useSaveForumPost = () => {
  const { queryClient, viewerId } = useForumCache();

  return useMutation<
    ForumPost,
    AppError,
    { postId?: string; payload: SaveForumPostPayload; images: ForumLocalImage[] }
  >({
    mutationFn: async ({ postId, payload, images }) => {
      const imageKeys = await Promise.all(
        images.map((image) => image.uploadedKey ?? forumService.uploadImage(image))
      );
      const body = { ...payload, imageKeys };

      return postId ? forumService.updatePost(postId, body) : forumService.createPost(body);
    },
    onSuccess: async (post) => {
      queryClient.setQueryData(FORUM_QUERY_KEYS.POST(viewerId, post.id), post);
      await queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEYS.FEEDS(viewerId) });
    },
  });
};

export const useDeleteForumPost = () => {
  const { queryClient, viewerId } = useForumCache();

  return useMutation<void, AppError, string>({
    mutationFn: forumService.deletePost,
    onSuccess: async (_result, postId) => {
      queryClient.removeQueries({ queryKey: FORUM_QUERY_KEYS.POST(viewerId, postId) });
      await queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEYS.FEEDS(viewerId) });
    },
  });
};

export const useCreateForumComment = (postId: string) => {
  const { queryClient, viewerId, patchPost } = useForumCache();

  return useMutation<ForumComment, AppError, CreateForumCommentPayload>({
    mutationFn: (payload) => forumService.createComment(postId, payload),
    onSuccess: async () => {
      patchPost(postId, (post) => ({ ...post, commentCount: post.commentCount + 1 }));
      await queryClient.invalidateQueries({
        queryKey: FORUM_QUERY_KEYS.COMMENTS(viewerId, postId),
      });
    },
  });
};

export const useDeleteForumComment = (postId: string) => {
  const { queryClient, viewerId } = useForumCache();

  return useMutation<void, AppError, string>({
    mutationFn: forumService.deleteComment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEYS.COMMENTS(viewerId, postId) }),
        queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEYS.POST(viewerId, postId) }),
      ]);
    },
  });
};

export const useReportForumContent = () => {
  const { queryClient, viewerId } = useForumCache();

  return useMutation<Awaited<ReturnType<typeof forumService.report>>, AppError, ForumReportPayload>(
    {
      mutationFn: forumService.report,
      onSuccess: async (result) => {
        if (!result.isHidden) return;

        await queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEYS.VIEWER(viewerId) });
      },
    }
  );
};

export const useCheckForumContent = () =>
  useMutation({
    mutationFn: forumService.checkContent,
  });
