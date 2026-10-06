import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AlertTriangle, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, HeaderBar, ListingCard, ListingCardSkeleton, ScreenContainer } from '@ui';
import { useFavorites, useToggleFavorite } from '../hooks';
import type { SearchListingItem } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getCardStatus = (listing: SearchListingItem) => {
  if (listing.availability === 'rented') return 'rented';

  if (listing.availability === 'paused') return 'paused';

  return listing.availability === 'holding' ? 'holding' : 'available';
};

export const SavedRoomsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const listings = useMemo(
    () => favoritesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [favoritesQuery.data]
  );

  const renderContent = () => {
    if (favoritesQuery.isPending) {
      return (
        <View style={styles.list}>
          {[1, 2, 3].map((item) => (
            <ListingCardSkeleton key={item} />
          ))}
        </View>
      );
    }

    if (favoritesQuery.isError) {
      return (
        <EmptyState
          icon={<AlertTriangle size={34} color={THEME_COLORS.ERROR} />}
          title="Không thể tải phòng đã lưu"
          description="Kết nối đang có vấn đề. Vui lòng thử lại."
          actionTitle="Thử lại"
          onAction={() => favoritesQuery.refetch()}
        />
      );
    }

    if (listings.length === 0) {
      return (
        <EmptyState
          icon={<Heart size={38} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          title="Bạn chưa lưu phòng nào"
          description="Nhấn biểu tượng trái tim ở tin đăng để lưu lại và xem sau."
          actionTitle="Tìm phòng ngay"
          onAction={() => navigation.navigate('Main', { screen: 'Search' })}
        />
      );
    }

    return (
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={favoritesQuery.isRefetching && !favoritesQuery.isFetchingNextPage}
            onRefresh={() => favoritesQuery.refetch()}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        onEndReached={() => {
          if (favoritesQuery.hasNextPage && !favoritesQuery.isFetchingNextPage) {
            void favoritesQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          favoritesQuery.isFetchingNextPage ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loadMore} />
          ) : null
        }
        renderItem={({ item }) => (
          <ListingCard
            id={item.id}
            title={item.title}
            price={item.price}
            imageUrl={item.thumbnail ?? undefined}
            areaSquareMeters={item.area}
            capacity={item.capacity}
            address={item.address}
            status={getCardStatus(item)}
            isSaved
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            onBookmarkPress={() => toggleFavorite.mutate({ listingId: item.id, isSaved: true })}
            variant="horizontal"
            compact
            style={styles.card}
          />
        )}
      />
    );
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar
        title="Phòng đã lưu"
        onBack={() => navigation.goBack()}
        subtitle={listings.length > 0 ? `${listings.length} phòng` : undefined}
      />
      {renderContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  card: { marginBottom: SPACING_TOKENS.SM + 4 },
  loadMore: { marginVertical: SPACING_TOKENS.MD },
});
