import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageSquareText, Plus, Search, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, FilterChip, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { ForumPostCard, ForumPostSkeleton } from '../components';
import { useForumFeed, useToggleForumLike } from '../hooks';
import type { ForumCategory, ForumFeedFilters, ForumPost, RoommateGender } from '../types';
import { FORUM_BUDGET_FILTER, FORUM_CATEGORY_OPTIONS, ROOMMATE_GENDER_OPTIONS } from '../types';
import { formatCompactMillion } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommunityRouteProp = RouteProp<RootStackParamList, 'Community'>;

const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_ITEMS = [0, 1, 2];

export const CommunityScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommunityRouteProp>();
  const toast = useToast();
  const [category, setCategory] = useState<ForumCategory | undefined>(route.params?.category);
  const [gender, setGender] = useState<RoommateGender | undefined>();
  const [isBudgetOnly, setIsBudgetOnly] = useState(false);
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');

  const isRoommateFeed = category === 'roommate';

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchText.trim()), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText]);

  const filters = useMemo<ForumFeedFilters>(
    () => ({
      category,
      keyword: keyword || undefined,
      ...(isRoommateFeed
        ? {
            gender,
            maxCost: isBudgetOnly ? FORUM_BUDGET_FILTER : undefined,
            roommateStatus: isOpenOnly ? 'open' : undefined,
          }
        : {}),
    }),
    [category, keyword, isRoommateFeed, gender, isBudgetOnly, isOpenOnly]
  );

  const feedQuery = useForumFeed(filters);
  const { mutate: toggleLike } = useToggleForumLike();

  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data]
  );
  const total = feedQuery.data?.pages[0]?.total ?? 0;
  const genderLabel = ROOMMATE_GENDER_OPTIONS.find((option) => option.value === gender)?.label;

  const handleOpenPost = useCallback(
    (post: ForumPost) => navigation.navigate('ForumPostDetail', { postId: post.id }),
    [navigation]
  );

  const handleToggleLike = useCallback(
    (post: ForumPost) =>
      toggleLike(
        { postId: post.id, isLiked: post.isLiked },
        { onError: (error) => toast.error(error.message, 'Không thể thả tim') }
      ),
    [toggleLike, toast]
  );

  const handleCreatePost = () => navigation.navigate('ForumPostComposer', { category });

  const handleLoadMore = () => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      void feedQuery.fetchNextPage();
    }
  };

  const handleToggleSearch = () => {
    if (isSearchVisible) {
      setSearchText('');
    }

    setIsSearchVisible((isVisible) => !isVisible);
  };

  const renderEmpty = () => {
    if (feedQuery.isLoading) {
      return (
        <View>
          {SKELETON_ITEMS.map((item) => (
            <ForumPostSkeleton key={item} />
          ))}
        </View>
      );
    }

    if (feedQuery.isError) {
      return (
        <EmptyState
          title="Không tải được bài viết"
          description={feedQuery.error.message}
          actionTitle="Thử lại"
          onAction={() => void feedQuery.refetch()}
        />
      );
    }

    return (
      <EmptyState
        icon={<MessageSquareText size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        title={keyword ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
        description={
          keyword
            ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc nhé.'
            : 'Hãy là người đầu tiên chia sẻ kinh nghiệm hoặc tìm bạn ở ghép.'
        }
        actionTitle="Viết bài đầu tiên"
        onAction={handleCreatePost}
      />
    );
  };

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title={isRoommateFeed ? 'Tìm bạn ở ghép' : 'Cộng đồng'}
        alignTitle="left"
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        hasBottomBorder={false}
        rightAction={
          <TouchableOpacity
            onPress={handleToggleSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isSearchVisible ? 'Đóng tìm kiếm' : 'Tìm kiếm bài viết'}
          >
            {isSearchVisible ? (
              <X size={22} color={THEME_COLORS.TEXT_PRIMARY} />
            ) : (
              <Search size={22} color={THEME_COLORS.TEXT_PRIMARY} />
            )}
          </TouchableOpacity>
        }
      />

      {isSearchVisible ? (
        <View style={styles.searchBox}>
          <Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm theo tiêu đề, nội dung, khu vực…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            autoFocus
            returnKeyType="search"
          />
        </View>
      ) : null}

      <View style={styles.filterArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <FilterChip
            label="Tất cả"
            isSelected={!category}
            onPress={() => setCategory(undefined)}
          />

          {FORUM_CATEGORY_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              isSelected={category === option.value}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </ScrollView>

        {isRoommateFeed ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {ROOMMATE_GENDER_OPTIONS.filter((option) => option.value !== 'any').map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isSelected={gender === option.value}
                onPress={() => setGender(gender === option.value ? undefined : option.value)}
              />
            ))}

            <FilterChip
              label={`Dưới ${formatCompactMillion(FORUM_BUDGET_FILTER)}`}
              isSelected={isBudgetOnly}
              onPress={() => setIsBudgetOnly((isSelected) => !isSelected)}
            />

            <FilterChip
              label="Còn chỗ"
              isSelected={isOpenOnly}
              onPress={() => setIsOpenOnly((isSelected) => !isSelected)}
            />
          </ScrollView>
        ) : null}
      </View>

      {isRoommateFeed && feedQuery.isSuccess ? (
        <View style={styles.summaryBar}>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            <Typography variant="caption" weight="BOLD" colorKey="TEXT_PRIMARY">
              {total} bài
            </Typography>
            {` đang tìm bạn ở ghép${genderLabel ? ` ${genderLabel.toLowerCase()}` : ''}`}
          </Typography>
        </View>
      ) : null}

      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <ForumPostCard
            post={item}
            isRoommateFeed={isRoommateFeed}
            onPress={handleOpenPost}
            onToggleLike={handleToggleLike}
          />
        )}
        contentContainerStyle={[styles.listContent, !posts.length && styles.emptyContent]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          feedQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={THEME_COLORS.PRIMARY} />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={feedQuery.isRefetching && !feedQuery.isFetchingNextPage}
            onRefresh={() => void feedQuery.refetch()}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreatePost} activeOpacity={0.85}>
        <Plus size={20} color={THEME_COLORS.WHITE} />
        <Typography variant="body2" weight="BOLD" colorKey="WHITE">
          Đăng bài
        </Typography>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    marginHorizontal: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    height: 44,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchInput: {
    flex: 1,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  filterArea: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.BORDER,
    paddingBottom: SPACING_TOKENS.SM,
  },
  chipRow: {
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
  },
  summaryBar: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 2,
  },
  listContent: {
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: 96,
  },
  emptyContent: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: SPACING_TOKENS.MD,
  },
  fab: {
    position: 'absolute',
    right: SPACING_TOKENS.MD,
    bottom: SPACING_TOKENS.LG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS + 2,
    height: 52,
    paddingHorizontal: SPACING_TOKENS.LG - 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
