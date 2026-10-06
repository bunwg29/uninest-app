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
  Clock3,
  EllipsisVertical,
  ImageOff,
  Info,
  Search,
  X,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { formatVND } from '@core';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS } from '@theme';
import {
  useLandlordListingDetailMutation,
  useLandlordListingMutation,
  useLandlordListings,
} from '../hooks';
import type { LandlordListing, LandlordListingStatus } from '../types';
import {
  Button,
  EmptyState,
  GradientView,
  LoadingOverlay,
  Modal,
  ScreenContainer,
  SkeletonBox,
  Typography,
} from '@ui';
import { useResponsiveLayout, useToast } from '@hooks';
import { useListingPostStore } from '../store/listingPostStore';
import { LANDLORD_STATUS_LABELS, LANDLORD_STATUS_TONES, LandlordStatusPill } from '../components';

type StatusTab = {
  key: LandlordListingStatus;
  label: string;
};

const STATUS_TABS: StatusTab[] = [
  { key: 'published', label: 'Đang hiển thị' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
  { key: 'hidden', label: 'Đã ẩn' },
  { key: 'expired', label: 'Đã cho thuê' },
  { key: 'paused', label: 'Ngừng nhận yêu cầu' },
];

type ListingAction = {
  key: 'viewDetail' | 'edit' | 'hide' | 'delete' | 'republish' | 'cancel';
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
  const hasAnyListings = counters ? Object.values(counters).some((count) => count > 0) : false;

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
        onSuccess: (result) => {
          const wasPaused =
            action === 'delete' && typeof result === 'object' && result?.deleted === false;
          const successMessage = wasPaused
            ? 'Tin đã có lịch hẹn hoặc giữ chỗ nên chuyển sang "Ngừng nhận yêu cầu"'
            : action === 'hide'
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
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <View style={[styles.header, isSearchVisible && styles.headerWithSearch]}>
        <Typography variant="h1" weight="BOLD" style={styles.headerTitle}>
          Tin đăng
        </Typography>

        <TouchableOpacity
          style={styles.searchButton}
          accessibilityLabel="Tìm kiếm tin đăng"
          onPress={handleToggleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={20} color={THEME_COLORS.TEXT_PRIMARY} />
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
                title={
                  normalizedSearchText
                    ? 'Không tìm thấy tin đăng'
                    : hasAnyListings
                      ? getEmptyTitle(activeStatus)
                      : 'Chưa có tin đăng nào'
                }
                description={
                  normalizedSearchText
                    ? 'Thử tìm với từ khóa khác.'
                    : getEmptyDescription(activeStatus)
                }
                actionTitle={
                  activeStatus === 'published' && !normalizedSearchText
                    ? 'Đăng tin ngay'
                    : undefined
                }
                onAction={
                  activeStatus === 'published' && !normalizedSearchText
                    ? handleCreateListing
                    : undefined
                }
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

          if (action === 'viewDetail' && selectedListing) {
            navigation.getParent()?.navigate('ListingDetail', { id: selectedListing.id });
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
    </ScreenContainer>
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
        const count = counters?.[item.key];

        return (
          <TouchableOpacity
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Typography
              variant="body2"
              weight={isActive ? 'BOLD' : 'MEDIUM'}
              color={isActive ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_SECONDARY}
              style={styles.tabLabel}
            >
              {count ? `${item.label} ${count}` : item.label}
            </Typography>
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
  const { isCompact } = useResponsiveLayout();
  const isHolding = listing.holdingStatus && listing.status === 'published';
  const imageTip = getImageTip(listing);

  return (
    <TouchableOpacity
      style={[styles.card, isCompact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.thumbnail, isCompact && styles.thumbnailCompact]}>
          {listing.imageUrl && !hasImageError ? (
            <Image
              source={{ uri: listing.imageUrl }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <GradientView
              colors={[OVERLAY_COLORS.FIELD_BORDER, THEME_COLORS.SURFACE_MUTED]}
              style={styles.thumbnailPlaceholder}
            >
              <ImageOff size={22} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </GradientView>
          )}
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.badgesRow}>
            {isHolding ? (
              <LandlordStatusPill label="Đang giữ chỗ" tone="warning" />
            ) : (
              <LandlordStatusPill
                label={LANDLORD_STATUS_LABELS[listing.status]}
                tone={LANDLORD_STATUS_TONES[listing.status]}
              />
            )}
            {listing.isFeatured ? <LandlordStatusPill label="Nổi bật" tone="featured" /> : null}
          </View>
          <Typography variant="body2" weight="BOLD" numberOfLines={2} style={styles.cardTitle}>
            {listing.title}
          </Typography>
          <View style={styles.priceRow}>
            <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
              {formatListingPrice(listing.price)}
            </Typography>
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              {`/tháng${Number.isFinite(listing.area) ? ` · ${listing.area} m²` : ''}`}
            </Typography>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          accessibilityLabel={`Thao tác với tin ${listing.title}`}
          hitSlop={SPACING_TOKENS.XS}
        >
          <EllipsisVertical size={20} color={THEME_COLORS.TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      {listing.status === 'published' && Number.isFinite(listing.viewCount) ? (
        <View style={styles.statsRow}>
          <Stat label="Lượt xem" value={listing.viewCount} />
          <View style={styles.statDivider} />
          <Stat label="Liên hệ" value={listing.contactCount ?? 0} />
          <View style={styles.statDivider} />
          <Stat label="Đã lưu" value={listing.saveCount ?? 0} />
        </View>
      ) : null}

      {isHolding && listing.holderName ? (
        <View style={[styles.note, styles.noteWarning]}>
          <Clock3 size={16} color={THEME_COLORS.WARNING} style={styles.noteIcon} />
          <Typography variant="body2" colorKey="WARNING" style={styles.noteText}>
            {getHoldingNote(listing)}
          </Typography>
        </View>
      ) : null}

      {imageTip ? (
        <View style={[styles.note, styles.noteInfo]}>
          <Info size={16} color={THEME_COLORS.PRIMARY_DARK} style={styles.noteIcon} />
          <Typography variant="body2" colorKey="PRIMARY_DARK" style={styles.noteText}>
            {imageTip}
          </Typography>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Typography variant="body1" weight="BOLD">
      {value.toLocaleString('vi-VN')}
    </Typography>
    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
      {label}
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
  const viewDetail: ListingAction = { key: 'viewDetail', label: 'Xem chi tiết phòng' };

  if (status === 'published') {
    return [
      viewDetail,
      { key: 'edit', label: 'Sửa' },
      { key: 'hide', label: 'Ẩn tin' },
      commonDelete,
    ];
  }

  if (status === 'hidden') {
    return [
      viewDetail,
      { key: 'edit', label: 'Sửa' },
      { key: 'republish', label: 'Hiện tin' },
      commonDelete,
    ];
  }

  if (status === 'paused') {
    return [viewDetail, { key: 'edit', label: 'Sửa' }, { key: 'republish', label: 'Mở lại tin' }];
  }

  if (status === 'rejected') {
    return [viewDetail, { key: 'edit', label: 'Sửa' }, commonDelete];
  }

  return status === 'pending'
    ? [
        viewDetail,
        { key: 'edit', label: 'Sửa' },
        { key: 'cancel', label: 'Hủy gửi duyệt', danger: true },
      ]
    : [viewDetail, { key: 'edit', label: 'Sửa' }, commonDelete];
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

const MIN_RECOMMENDED_IMAGES = 6;

function getHoldingNote(listing: LandlordListing): string {
  const expireDate = listing.holdExpireDate ? new Date(listing.holdExpireDate) : null;
  const expireText =
    expireDate && !Number.isNaN(expireDate.getTime())
      ? ` giữ chỗ tới ${String(expireDate.getDate()).padStart(2, '0')}/${String(expireDate.getMonth() + 1).padStart(2, '0')}`
      : ' đang giữ chỗ';
  const depositText = listing.depositAmount
    ? ` · đã cọc ${formatListingPrice(listing.depositAmount)}`
    : '';

  return `Bạn ${listing.holderName}${expireText}${depositText}`;
}

function getImageTip(listing: LandlordListing): string | null {
  const imageCount = listing.imageUrls?.length;

  if (listing.status !== 'published' || imageCount === undefined) return null;

  return imageCount < MIN_RECOMMENDED_IMAGES
    ? `Tin này chỉ có ${imageCount} ảnh. Thêm ảnh WC và lối vào để tăng lượt liên hệ.`
    : null;
}

function formatListingPrice(value: number): string {
  return Number.isFinite(value) ? formatVND(value).replace(' ₫', 'đ') : 'Chưa cập nhật giá';
}

function getEmptyTitle(status: LandlordListingStatus): string {
  return status === 'hidden'
    ? 'Bạn chưa ẩn tin nào'
    : `Không có tin đăng ở trạng thái ${STATUS_TABS.find((tab) => tab.key === status)?.label.toLowerCase()}`;
}

function getEmptyDescription(status: LandlordListingStatus): string {
  return status === 'published'
    ? 'Đăng tin để bắt đầu tiếp cận người tìm phòng.'
    : 'Các tin đăng phù hợp sẽ xuất hiện tại đây.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  headerTitle: { letterSpacing: -0.5 },
  header: {
    height: 56,
    paddingHorizontal: SPACING_TOKENS.MD,
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
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  listContent: { paddingBottom: SPACING_TOKENS.LG },
  tabsContainer: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  tabsContent: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: 13,
    gap: SPACING_TOKENS.SM,
  },
  tab: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  tabLabel: { fontSize: 13, lineHeight: 20 },
  activeTab: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  card: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD,
    padding: 14,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
  },
  cardCompact: {
    marginHorizontal: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  thumbnailCompact: {
    width: 64,
    height: 64,
  },
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: { flex: 1, minWidth: 0, marginLeft: 12 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  cardTitle: { marginBottom: 4 },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
  },
  menuButton: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING_TOKENS.XS,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  statDivider: { width: 1, height: 39, backgroundColor: THEME_COLORS.BORDER },
  note: {
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
  },
  noteWarning: {
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  noteInfo: {
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  noteIcon: { marginTop: 2 },
  noteText: { flex: 1, marginLeft: 10, fontSize: 13 },
  stat: { flex: 1, alignItems: 'center' },
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
