import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trash2 } from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useSavedSearchActions, useSavedSearches } from '../hooks/useSavedSearches';
import type { SavedSearch } from '../services/savedSearchService';

export const SavedSearchesScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'SavedSearches'>>();
  const query = useSavedSearches();
  const { update, remove } = useSavedSearchActions();
  const toast = useToast();
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  const handleToggle = useCallback(
    async (item: SavedSearch) => {
      try {
        await update.mutateAsync({ id: item.id, enabled: !item.enabled });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể cập nhật bộ lọc');
      }
    },
    [toast, update]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      try {
        await remove.mutateAsync(id);
        toast.success('Đã xoá bộ lọc');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể xoá bộ lọc');
      }
    },
    [remove, toast]
  );

  const renderItem = useCallback(
    ({ item }: { item: SavedSearch }) => (
      <View style={styles.item}>
        <View style={styles.itemText}>
          <Typography variant="body2" weight="SEMIBOLD">
            {item.name}
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {typeof item.criteria.keyword === 'string' && item.criteria.keyword
              ? item.criteria.keyword
              : 'Tất cả khu vực'}
          </Typography>
          <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
            Tạo ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Typography>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => void handleToggle(item)}
          disabled={update.isPending}
          accessibilityLabel={`Bật thông báo cho ${item.name}`}
        />
        <Pressable
          onPress={() => void handleRemove(item.id)}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel={`Xoá bộ lọc ${item.name}`}
        >
          <Trash2 size={19} color={THEME_COLORS.ERROR} />
        </Pressable>
      </View>
    ),
    [handleRemove, handleToggle, remove.isPending, update.isPending]
  );

  return (
    <ScreenContainer keyboardAvoiding={false} style={styles.container}>
      <HeaderBar title="Bộ lọc đã lưu" onBack={() => navigation.goBack()} />
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <EmptyState title="Không tải được bộ lọc" description="Vui lòng thử lại sau." />
          <Button title="Thử lại" onPress={() => void query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Chưa lưu bộ lọc"
              description="Lưu bộ lọc khi tìm phòng để nhận thông báo tin mới phù hợp."
              actionTitle="Tìm phòng"
              onAction={() => navigation.navigate('Main', { screen: 'Search' })}
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? <ActivityIndicator color={THEME_COLORS.PRIMARY} /> : null
          }
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: THEME_COLORS.BACKGROUND },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING_TOKENS.MD },
  list: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.SM },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    minHeight: 88,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  itemText: { flex: 1, gap: SPACING_TOKENS.XS },
  deleteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
