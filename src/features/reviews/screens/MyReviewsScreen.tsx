import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, MessageSquareText } from 'lucide-react-native';
import { EmptyState, HeaderBar, ScreenContainer, SkeletonBox, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { ReviewCard } from '../components';
import { useMyReviews } from '../hooks';
import type { MyReview } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyReviews'>;

export const MyReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const reviewsQuery = useMyReviews();
  const reviews = useMemo(
    () => reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewsQuery.data]
  );

  const renderReview = ({ item }: { item: MyReview }) => {
    const canEdit = new Date(item.editedUntil).getTime() >= Date.now();

    return (
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.listing}
          onPress={() => navigation.navigate('ListingDetail', { id: item.listing.id })}
          accessibilityRole="button"
          accessibilityLabel={`Xem ${item.listing.title}`}
        >
          <View style={styles.listingCopy}>
            <Typography variant="body1" weight="SEMIBOLD" numberOfLines={2}>
              {item.listing.title}
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED" numberOfLines={2}>
              {item.listing.address}
            </Typography>
          </View>
          <ChevronRight size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        </TouchableOpacity>
        <ReviewCard
          review={item}
          canEdit={canEdit}
          onEdit={() =>
            navigation.navigate('ReviewForm', {
              listingId: item.listing.id,
              listingTitle: item.listing.title,
              review: item,
            })
          }
        />
        {!canEdit ? (
          <Typography variant="caption" colorKey="TEXT_MUTED">
            Đã hết thời hạn 7 ngày để chỉnh sửa đánh giá này.
          </Typography>
        ) : null}
      </View>
    );
  };

  if (reviewsQuery.isLoading) {
    return (
      <ScreenContainer padding="md" keyboardAvoiding={false}>
        <HeaderBar title="Đánh giá của tôi" onBack={() => navigation.goBack()} />
        <View style={styles.skeletons}>
          <SkeletonBox height={220} />
          <SkeletonBox height={220} />
        </View>
      </ScreenContainer>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đánh giá của tôi" onBack={() => navigation.goBack()} />
        <EmptyState
          title="Không thể tải đánh giá"
          description="Vui lòng kiểm tra kết nối và thử lại."
          actionTitle="Thử lại"
          onAction={() => void reviewsQuery.refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Đánh giá của tôi" onBack={() => navigation.goBack()} />
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={reviewsQuery.isRefetching && !reviewsQuery.isFetchingNextPage}
            onRefresh={() => void reviewsQuery.refetch()}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            void reviewsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <EmptyState
            title="Bạn chưa có đánh giá nào"
            description="Sau khi hoàn thành lịch xem phòng, đánh giá của bạn sẽ xuất hiện tại đây."
            icon={<MessageSquareText size={36} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          />
        }
        ListFooterComponent={
          reviewsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.footer} />
          ) : undefined
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  item: {
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  listing: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.SM,
  },
  listingCopy: { flex: 1, gap: SPACING_TOKENS.XS },
  separator: { height: SPACING_TOKENS.MD },
  skeletons: { gap: SPACING_TOKENS.MD },
  footer: { marginVertical: SPACING_TOKENS.LG },
});
