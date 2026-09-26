import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal as RNModal,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  ChevronRight,
  EllipsisVertical,
  ImageOff,
  Search,
  X,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import {
  useLandlordListingDetailMutation,
  useLandlordListingMutation,
  useLandlordListings,
} from '../hooks';
import type { LandlordListing, LandlordListingStatus } from '../types';
import { Badge, Button, EmptyState, LoadingOverlay, Modal, SkeletonBox, Typography } from '@ui';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { useListingPostStore } from '../store/listingPostStore';

type StatusTab = {
  key: LandlordListingStatus;
  label: string;
};

const STATUS_TABS: StatusTab[] = [
  { key: 'published', label: 'Đang hiện' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
  { key: 'hidden', label: 'Đã ẩn' },
];

const STATUS_LABELS: Record<LandlordListingStatus, string> = {
  published: 'ĐANG HIỂN THỊ',
  pending: 'CHỜ DUYỆT',
  rejected: 'BỊ TỪ CHỐI',
  hidden: 'ĐÃ ẨN',
  expired: 'HẾT HẠN',
};

const STATUS_VARIANTS: Record<LandlordListingStatus, 'available' | 'holding' | 'neutral'> = {
  published: 'available',
  pending: 'holding',
  rejected: 'holding',
  hidden: 'neutral',
  expired: 'neutral',
};

type ListingAction = {
  key: 'edit' | 'hide' | 'delete' | 'republish' | 'cancel';
  label: string;
  danger?: boolean;
};

export const LandlordListingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const mutationLockRef = useRef(false);
  const [activeStatus, setActiveStatus] = useState<LandlordListingStatus>('published');
  const [selectedListing, setSelectedListing] = useState<LandlordListing | null>(null);
  const [confirmAction, setConfirmAction] = useState<'hide' | 'delete' | 'cancel' | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const normalizedSearchText = searchText.trim();
  const listingsQuery = useLandlordListings(activeStatus, normalizedSearchText);
  const listingMutation = useLandlordListingMutation();
  const listingDetailMutation = useLandlordListingDetailMutation();
  const listings = useMemo(
    () => listingsQuery.data?.pages.flatMap((page) => page.items) || [],
    [listingsQuery.data]
  );
  const counters = listingsQuery.data?.pages[0]?.counters;

  const refetchRef = useRef(listingsQuery.refetch);

  refetchRef.current = listingsQuery.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetchRef.current();
    }, [])
  );

  const handleRefresh = () => {
    void listingsQuery.refetch();
  };

  const handleToggleSearch = () => {
    if (isSearchVisible) {
      Keyboard.dismiss();
      setSearchText('');
      setIsSearchVisible(false);

      return;
    }

    setIsSearchVisible(true);
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setSearchText('');
    setIsSearchVisible(false);
  };

  const handleCreateListing = () => {
    useListingPostStore.getState().initCreate();
    navigation.getParent()?.navigate('ListingPost', {
      screen: 'ListingPostBasicInfo',
      params: undefined,
    });
  };

  const handleEditListing = async (listing: LandlordListing) => {
    try {
      const listingDetail = await listingDetailMutation.mutateAsync(listing.id);

      useListingPostStore.getState().initEdit(listingDetail);
      navigation.getParent()?.navigate('ListingPost', {
        screen: 'ListingPostBasicInfo',
        params: { listingId: listing.id, listing: listingDetail },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải thông tin tin đăng');
    }
  };

  const executeListingMutation = (
    action: 'hide' | 'republish' | 'delete',
    listingId: string,
    onSuccess?: () => void
  ) => {
    if (mutationLockRef.current) return;

    mutationLockRef.current = true;
    listingMutation.mutate(
      { action, id: listingId },
      {
        onSuccess: () => {
          const successMessage =
            action === 'hide'
              ? 'Đã ẩn tin đăng'
              : action === 'republish'
                ? 'Đã hiển thị lại tin đăng'
                : 'Đã xoá tin đăng';

          toast.success(successMessage);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Không thể cập nhật tin đăng');
        },
        onSettled: () => {
          mutationLockRef.current = false;
        },
      }
    );
  };

  const handleConfirmAction = () => {
    if (!selectedListing || !confirmAction) return;

    executeListingMutation(
      confirmAction === 'cancel' ? 'delete' : confirmAction,
      selectedListing.id,
      () => {
        setConfirmAction(null);
        setSelectedListing(null);
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isSearchVisible && styles.headerWithSearch]}>
        <Typography variant="h1" weight="BOLD">
          Tin đăng của tôi
        </Typography>

        <TouchableOpacity
          style={styles.searchButton}
          accessibilityLabel="Tìm kiếm tin đăng"
          onPress={handleToggleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={22} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {isSearchVisible ? (
        <View style={styles.searchFieldContainer}>
          <Search size={18} color={THEME_COLORS.TEXT_MUTED} />
          <TextInput
            autoFocus
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm theo tên tin đăng"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            style={styles.searchField}
          />
          <TouchableOpacity
            style={styles.closeSearchButton}
            onPress={handleCloseSearch}
            accessibilityLabel="Đóng tìm kiếm"
          >
            <X size={18} color={THEME_COLORS.TEXT_MUTED} />
          </TouchableOpacity>
        </View>
      ) : null}

      {listingsQuery.isError ? (
        <View style={styles.errorState}>
          <AlertCircle size={38} color={THEME_COLORS.ERROR} />
          <Typography variant="h3" weight="BOLD" align="center" style={styles.errorTitle}>
            Không thể tải tin đăng
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            Vui lòng kiểm tra kết nối và thử lại.
          </Typography>
          <Button title="Thử lại" onPress={handleRefresh} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LandlordListingCard
              listing={item}
              onPress={() =>
                navigation.getParent()?.navigate('LandlordListingDetail', { listing: item })
              }
              onMenuPress={() => setSelectedListing(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <StatusTabs
              activeStatus={activeStatus}
              counters={counters}
              onChange={setActiveStatus}
            />
          }
          ListEmptyComponent={
            listingsQuery.isLoading ? (
              <ListingsSkeleton />
            ) : (
              <EmptyState
                title={getEmptyTitle(activeStatus)}
                description={getEmptyDescription(activeStatus)}
                actionTitle={activeStatus === 'published' ? 'Đăng tin ngay' : undefined}
                onAction={activeStatus === 'published' ? handleCreateListing : undefined}
                style={styles.emptyState}
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={listingsQuery.isRefetching && !listingsQuery.isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor={THEME_COLORS.PRIMARY}
            />
          }
          onEndReached={() => {
            if (listingsQuery.hasNextPage && !listingsQuery.isFetchingNextPage) {
              void listingsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            listingsQuery.isFetchingNextPage ? (
              <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.footerLoader} />
            ) : null
          }
        />
      )}

      <ListingActionSheet
        listing={confirmAction ? null : selectedListing}
        onClose={() => setSelectedListing(null)}
        onConfirmAction={setConfirmAction}
        onAction={(action) => {
          if (action === 'republish') {
            if (selectedListing) executeListingMutation(action, selectedListing.id);

            setSelectedListing(null);

            return;
          }

          if (action === 'edit' && selectedListing) {
            void handleEditListing(selectedListing);
            setSelectedListing(null);

            return;
          }

          setSelectedListing(null);
        }}
      />

      <Modal
        isVisible={Boolean(confirmAction)}
        onClose={() => {
          setConfirmAction(null);
          setSelectedListing(null);
        }}
        title={
          confirmAction === 'delete'
            ? 'Xoá tin đăng?'
            : confirmAction === 'cancel'
              ? 'Huỷ gửi duyệt?'
              : 'Ẩn tin đăng?'
        }
        description={
          confirmAction === 'delete'
            ? 'Tin đăng sẽ bị xoá khỏi danh sách của bạn và không thể khôi phục.'
            : confirmAction === 'cancel'
              ? 'Tin đăng sẽ được huỷ khỏi hàng chờ duyệt.'
              : 'Tin đăng sẽ không còn hiển thị với người tìm phòng.'
        }
        confirmText={
          confirmAction === 'delete'
            ? 'Xoá tin'
            : confirmAction === 'cancel'
              ? 'Huỷ gửi duyệt'
              : 'Ẩn tin'
        }
        confirmVariant="danger"
        onConfirm={handleConfirmAction}
        isConfirmLoading={listingMutation.isPending}
      />

      {(listingMutation.isPending && !confirmAction) || listingDetailMutation.isPending ? (
        <LoadingOverlay isFullScreen message="Đang cập nhật tin đăng..." />
      ) : null}
    </View>
  );
};

const StatusTabs = ({
  activeStatus,
  counters,
  onChange,
}: {
  activeStatus: LandlordListingStatus;
  counters?: Record<LandlordListingStatus, number>;
  onChange: (status: LandlordListingStatus) => void;
}) => (
  <View style={styles.tabsContainer}>
    <FlatList
      horizontal
      data={STATUS_TABS}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContent}
      renderItem={({ item }) => {
        const isActive = item.key === activeStatus;
        const count = counters?.[item.key] ?? 0;

        return (
          <TouchableOpacity
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(item.key)}
          >
            <Typography
              variant="caption"
              weight={isActive ? 'SEMIBOLD' : 'REGULAR'}
              color={isActive ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
            >
              {item.label}
            </Typography>
            <Badge label={count} variant={isActive ? 'primary' : 'neutral'} size="sm" />
          </TouchableOpacity>
        );
      }}
    />
  </View>
);

const LandlordListingCard = ({
  listing,
  onPress,
  onMenuPress,
}: {
  listing: LandlordListing;
  onPress: () => void;
  onMenuPress: () => void;
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardTopRow}>
        <View style={styles.thumbnail}>
          {listing.imageUrl && !hasImageError ? (
            <Image
              source={{ uri: listing.imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <ImageOff size={22} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </View>
          )}
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.badgesRow}>
            <Badge
              label={STATUS_LABELS[listing.status]}
              variant={listing.status === 'rejected' ? 'danger' : STATUS_VARIANTS[listing.status]}
              size="sm"
            />
            {listing.isFeatured ? <Badge label="NỔI BẬT" variant="featured" size="sm" /> : null}
          </View>
          <Typography variant="body1" weight="SEMIBOLD" numberOfLines={2} style={styles.cardTitle}>
            {listing.title}
          </Typography>
          <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
            {formatCurrency(listing.price)} ₫/tháng · {listing.area} m²
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED" numberOfLines={1}>
            {listing.address || 'Chưa cập nhật địa chỉ'}
          </Typography>
        </View>

        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <EllipsisVertical size={21} color={THEME_COLORS.TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Lượt xem" value={listing.viewCount} />
        <View style={styles.statDivider} />
        <Stat label="Liên hệ" value={listing.contactCount} />
        <View style={styles.statDivider} />
        <Stat label="Đã lưu" value={listing.saveCount} />
      </View>

      {listing.holdingStatus ? (
        <View style={styles.holdingBanner}>
          <Typography variant="caption" colorKey="WARNING">
            Bạn {listing.holderName} giữ chỗ tới {listing.holdExpireDate} · đã cọc{' '}
            {formatCurrency(listing.depositAmount || 0)} ₫
          </Typography>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="body2" weight="SEMIBOLD">
      {value.toLocaleString('vi-VN')}
    </Typography>
  </View>
);

const ListingActionSheet = ({
  listing,
  onClose,
  onConfirmAction,
  onAction,
}: {
  listing: LandlordListing | null;
  onClose: () => void;
  onConfirmAction: (action: 'hide' | 'delete' | 'cancel') => void;
  onAction: (action: ListingAction['key']) => void;
}) => {
  if (!listing) return null;

  const actions = getListingActions(listing.status);

  return (
    <RNModal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Typography variant="h3" weight="BOLD">
              Thao tác tin đăng
            </Typography>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={THEME_COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.sheetAction}
              onPress={() => {
                if (action.key === 'hide' || action.key === 'delete' || action.key === 'cancel') {
                  onConfirmAction(action.key);
                } else {
                  onAction(action.key);
                }
              }}
            >
              <Typography
                variant="body1"
                weight="SEMIBOLD"
                color={action.danger ? THEME_COLORS.ERROR : undefined}
              >
                {action.label}
              </Typography>
              <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};

function getListingActions(status: LandlordListingStatus): ListingAction[] {
  const commonDelete: ListingAction = { key: 'delete', label: 'Xoá tin', danger: true };

  if (status === 'published') {
    return [
      { key: 'edit', label: 'Sửa' },
      { key: 'hide', label: 'Ẩn tin' },
    ];
  }

  if (status === 'hidden') {
    return [
      { key: 'edit', label: 'Sửa' },
      { key: 'republish', label: 'Hiện tin' },
    ];
  }

  if (status === 'rejected') {
    return [{ key: 'edit', label: 'Sửa' }, commonDelete];
  }

  return status === 'pending'
    ? [
        { key: 'edit', label: 'Sửa' },
        { key: 'cancel', label: 'Hủy gửi duyệt', danger: true },
      ]
    : [{ key: 'edit', label: 'Sửa' }, commonDelete];
}

const ListingsSkeleton = () => (
  <View style={styles.skeletonList}>
    {Array.from({ length: 3 }).map((_, index) => (
      <View key={index} style={styles.skeletonCard}>
        <SkeletonBox width={92} height={92} borderRadius={BORDER_RADIUS_TOKENS.MD} />
        <View style={styles.skeletonDetails}>
          <SkeletonBox width="70%" height={18} />
          <SkeletonBox width="95%" height={16} style={styles.skeletonSpacing} />
          <SkeletonBox width="55%" height={16} style={styles.skeletonSpacing} />
        </View>
      </View>
    ))}
  </View>
);

function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN');
}

function getEmptyTitle(status: LandlordListingStatus): string {
  return status === 'hidden'
    ? 'Bạn chưa ẩn tin nào'
    : `Chưa có tin ${STATUS_TABS.find((tab) => tab.key === status)?.label.toLowerCase()}`;
}

function getEmptyDescription(status: LandlordListingStatus): string {
  return status === 'published'
    ? 'Đăng tin để bắt đầu tiếp cận người tìm phòng.'
    : 'Các tin đăng phù hợp sẽ xuất hiện tại đây.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  header: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerWithSearch: {
    paddingBottom: 0,
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  listContent: { paddingBottom: 110 },
  tabsContainer: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  tabsContent: { paddingHorizontal: SPACING_TOKENS.MD, paddingVertical: SPACING_TOKENS.SM },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.SM + 2,
    paddingVertical: SPACING_TOKENS.SM,
    marginRight: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  activeTab: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  card: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM + 2,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  cardDetails: { flex: 1, marginHorizontal: SPACING_TOKENS.SM },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.XS, marginBottom: 5 },
  cardTitle: { marginBottom: 4 },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING_TOKENS.SM,
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.XS,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: THEME_COLORS.DIVIDER },
  holdingBanner: {
    marginTop: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  emptyState: { flex: 1, minHeight: 420 },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
  },
  errorTitle: { marginTop: SPACING_TOKENS.MD, marginBottom: SPACING_TOKENS.XS },
  retryButton: { marginTop: SPACING_TOKENS.LG, minWidth: 140 },
  searchFieldContainer: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.MD,
    paddingLeft: SPACING_TOKENS.MD,
    paddingRight: 6,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchField: {
    flex: 1,
    height: 46,
    marginLeft: SPACING_TOKENS.SM,
    paddingVertical: 0,
    fontSize: 15,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  closeSearchButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  footerLoader: { paddingVertical: SPACING_TOKENS.LG },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23, 27, 34, 0.45)' },
  sheet: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.MD,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  sheetAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.MD,
  },
  skeletonList: { padding: SPACING_TOKENS.MD },
  skeletonCard: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  skeletonDetails: { flex: 1, marginLeft: SPACING_TOKENS.SM },
  skeletonSpacing: { marginTop: SPACING_TOKENS.SM },
});
