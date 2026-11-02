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
import { Plus, Search, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, FilterChip, ScreenContainer, SkeletonBox, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import {
  ForumEmptyFeed,
  ForumHeader,
  ForumPostCard,
  ForumPostSkeleton,
  type ForumPostSkeletonVariant,
} from '../components';
import { useForumFeed, useToggleForumLike } from '../hooks';
import type { ForumCategory, ForumFeedFilters, ForumPost, RoommateGender } from '../types';
import {
  FORUM_AREA_FILTER,
  FORUM_BUDGET_FILTER,
  FORUM_CATEGORY_OPTIONS,
  FORUM_COMPOSER_CATEGORY_LABELS,
  ROOMMATE_GENDER_OPTIONS,
} from '../types';
import { formatCompactMillion } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommunityRouteProp = RouteProp<RootStackParamList, 'Community'>;

const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_VARIANTS: ForumPostSkeletonVariant[] = ['table', 'images', 'compact'];
const CHIP_SKELETON_WIDTHS = [78, 126, 144];
const FAB_BOTTOM_OFFSET = 104;

export const CommunityScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommunityRouteProp>();
  const toast = useToast();
  const category: ForumCategory | undefined = route.params?.category;
  const [gender, setGender] = useState<RoommateGender | undefined>();
  const [isBudgetOnly, setIsBudgetOnly] = useState(false);
  const [isAreaOnly, setIsAreaOnly] = useState(false);
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
            area: isAreaOnly ? FORUM_AREA_FILTER : undefined,
            roommateStatus: isOpenOnly ? 'open' : undefined,
          }
        : {}),
    }),
    [category, keyword, isRoommateFeed, gender, isBudgetOnly, isAreaOnly, isOpenOnly]
  );

  const feedQuery = useForumFeed(filters);
  const { mutate: toggleLike } = useToggleForumLike();

  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data]
  );
  const total = feedQuery.data?.pages[0]?.total ?? 0;
  const genderLabel = ROOMMATE_GENDER_OPTIONS.find((option) => option.value === gender)?.label;
  const title =
    FORUM_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? 'Cộng đồng';

  const hasActiveFilters = Boolean(gender || isBudgetOnly || isAreaOnly || isOpenOnly);
  const isInitialLoading = feedQuery.isLoading && !category && !keyword;
  const isFeedEmpty = feedQuery.isSuccess && !posts.length && !keyword && !hasActiveFilters;
  const shouldShowSearch = isSearchVisible || !(isInitialLoading || isFeedEmpty);

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

  const handleOpenCategory = (nextCategory?: ForumCategory) => {
    if (category) {
      navigation.replace('Community', nextCategory ? { category: nextCategory } : undefined);

      return;
    }

    if (nextCategory) {
      navigation.push('Community', { category: nextCategory });
    }
  };

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

  const renderChips = () => {
    if (isInitialLoading) {
      return CHIP_SKELETON_WIDTHS.map((width) => (
        <SkeletonBox
          key={width}
          width={width}
          height={36}
          borderRadius={BORDER_RADIUS_TOKENS.FULL}
        />
      ));
    }

    if (isRoommateFeed) {
      return (
        <>
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
            label={FORUM_AREA_FILTER}
            isSelected={isAreaOnly}
            onPress={() => setIsAreaOnly((isSelected) => !isSelected)}
          />

          <FilterChip
            label="Còn chỗ"
            isSelected={isOpenOnly}
            onPress={() => setIsOpenOnly((isSelected) => !isSelected)}
          />
        </>
      );
    }

    return (
      <>
        <FilterChip
          label="Tất cả"
          isSelected={!category}
          onPress={() => handleOpenCategory(undefined)}
        />

        {FORUM_CATEGORY_OPTIONS.filter((option) => option.value !== category).map((option) => (
          <FilterChip
            key={option.value}
            label={category ? FORUM_COMPOSER_CATEGORY_LABELS[option.value] : option.label}
            onPress={() => handleOpenCategory(option.value)}
          />
        ))}
      </>
    );
  };

  const renderEmpty = () => {
    if (feedQuery.isLoading) {
      return (
        <View>
          {SKELETON_VARIANTS.map((variant) => (
            <ForumPostSkeleton key={variant} variant={variant} />
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
      <ForumEmptyFeed
        category={category}
        isSearching={Boolean(keyword)}
        onCreatePost={handleCreatePost}
        onViewOtherCategories={() => handleOpenCategory(undefined)}
      />
    );
  };

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <ForumHeader
        title={title}
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
        rightAction={
          shouldShowSearch ? (
            <TouchableOpacity
              onPress={handleToggleSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={isSearchVisible ? 'Đóng tìm kiếm' : 'Tìm kiếm bài viết'}
            >
              {isSearchVisible ? (
                <X size={21} color={THEME_COLORS.TEXT_PRIMARY} />
              ) : (
                <Search size={21} color={THEME_COLORS.TEXT_PRIMARY} />
              )}
            </TouchableOpacity>
          ) : null
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
          {renderChips()}
        </ScrollView>
      </View>

      {isRoommateFeed && feedQuery.isSuccess ? (
        <View style={styles.summaryBar}>
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.summaryText}>
            <Typography
              variant="body2"
              weight="BOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.summaryText}
            >
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
        ListEmptyComponent={renderEmpty() ?? undefined}
        ListFooterComponent={
          feedQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={THEME_COLORS.PRIMARY} />
          ) : undefined
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

      {isInitialLoading ? null : (
        <TouchableOpacity style={styles.fab} onPress={handleCreatePost} activeOpacity={0.85}>
          <Plus size={20} color={THEME_COLORS.WHITE} />
          <Typography variant="body1" weight="SEMIBOLD" colorKey="WHITE" style={styles.fabLabel}>
            Đăng bài
          </Typography>
        </TouchableOpacity>
      )}
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
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  filterArea: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
    paddingBottom: SPACING_TOKENS.SM + 4,
  },
  chipRow: {
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  summaryBar: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: FAB_BOTTOM_OFFSET + 72,
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
    bottom: FAB_BOTTOM_OFFSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    height: 52,
    paddingHorizontal: SPACING_TOKENS.LG - 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fabLabel: {
    lineHeight: 22,
  },
});
