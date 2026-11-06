import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AlertTriangle, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, ScreenContainer, Typography, BackButton } from '@ui';
import { SavedRoomRow, SearchResultSkeleton } from '../components';
import { useFavorites, useToggleFavorite } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      return <SearchResultSkeleton count={4} />;
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
            onRefresh={() => void favoritesQuery.refetch()}
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
          ) : undefined
        }
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => (
          <SavedRoomRow
            listing={item}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            onRemove={() => toggleFavorite.mutate({ listingId: item.id, isSaved: true })}
          />
        )}
      />
    );
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} accessibilityLabel="Quay lại" />
        <Typography variant="h3" weight="SEMIBOLD" style={styles.title}>
          Phòng đã lưu
        </Typography>
      </View>

      {listings.length > 0 ? (
        <View style={styles.summary}>
          <Typography variant="body2" weight="BOLD">
            {`${listings.length} phòng`}
            <Typography variant="body2" colorKey="TEXT_MUTED">
              {' đã lưu'}
            </Typography>
          </Typography>
        </View>
      ) : null}

      {renderContent()}
    </ScreenContainer>
  );
};

const ListSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  title: { flex: 1, fontSize: 18, lineHeight: 26 },
  summary: {
    height: 47,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  separator: { height: 12 },
  loadMore: { marginVertical: SPACING_TOKENS.MD },
});
