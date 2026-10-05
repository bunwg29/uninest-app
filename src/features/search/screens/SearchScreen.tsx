import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Home } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, ListingCardSkeleton, ScreenContainer, Typography } from '@ui';
import { RoomCard } from '../components';
import { useRooms } from '../hooks';
import type { Room } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const roomsQuery = useRooms();

  const handleBookRoom = (room: Room) => {
    navigation.navigate('BookingNew', { resourceId: room.id });
  };

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD">
          Tìm trọ
        </Typography>
        <Typography variant="body2" colorKey="TEXT_MUTED">
          Danh sách phòng đang có trên UniNest
        </Typography>
      </View>

      {roomsQuery.isLoading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ListingCardSkeleton key={index} />
          ))}
        </View>
      ) : roomsQuery.isError ? (
        <EmptyState
          title="Không tải được danh sách"
          description="Vui lòng kiểm tra kết nối và thử lại."
          actionTitle="Thử lại"
          onAction={() => roomsQuery.refetch()}
        />
      ) : (
        <FlatList
          data={roomsQuery.data ?? []}
          keyExtractor={(room) => room.id}
          renderItem={({ item }) => <RoomCard room={item} onBook={handleBookRoom} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={roomsQuery.isRefetching}
              onRefresh={roomsQuery.refetch}
              tintColor={THEME_COLORS.PRIMARY}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Chưa có phòng nào"
              description="Danh sách phòng sẽ xuất hiện tại đây sau khi được cập nhật."
              icon={<Home size={36} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    gap: SPACING_TOKENS.XXS,
  },
  listContent: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XXL },
  separator: { height: SPACING_TOKENS.MD },
});
