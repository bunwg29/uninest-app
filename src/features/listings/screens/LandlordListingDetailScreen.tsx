import { useState } from 'react';
import {
  Image,
  Modal as RNModal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  ChevronRight,
  EllipsisVertical,
  Eye,
  ImageOff,
  Pencil,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react-native';
import { Badge, Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { useResponsiveLayout } from '@hooks';
import { useLandlordListingDetail } from '../hooks';
import type { LandlordListing, LandlordListingStatus } from '../types';
import { useListingPostStore } from '../store/listingPostStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'LandlordListingDetail'>;

const STATUS_LABELS: Record<LandlordListingStatus, string> = {
  published: 'ĐANG HIỂN THỊ',
  pending: 'CHỜ DUYỆT',
  rejected: 'BỊ TỪ CHỐI',
  hidden: 'ĐÃ ẨN',
  expired: 'HẾT HẠN',
};

const STATUS_VARIANTS: Record<
  LandlordListingStatus,
  'available' | 'holding' | 'neutral' | 'danger'
> = {
  published: 'available',
  pending: 'holding',
  rejected: 'danger',
  hidden: 'neutral',
  expired: 'neutral',
};

export const LandlordListingDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { listing } = route.params;

  const detailQuery = useLandlordListingDetail(listing.id, listing);
  const currentListing = detailQuery.data ?? listing;
  const [hasImageError, setHasImageError] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { isCompact } = useResponsiveLayout();

  const isRejected = currentListing.status === 'rejected';

  const handleEdit = () => {
    useListingPostStore.getState().initEdit(currentListing);
    navigation.navigate('ListingPost', {
      screen: 'ListingPostBasicInfo',
      params: { listingId: currentListing.id, listing: currentListing },
    });
  };

  const handleEditSchedule = () => {
    useListingPostStore.getState().initEdit(currentListing);
    navigation.navigate('ListingPost', {
      screen: 'ListingPostSchedule',
    });
  };

  const handleStudentPreview = () => {
    navigation.navigate('StudentListingPreview', { listing: currentListing });
  };

  const handleMenuAction = (action: () => void) => {
    setIsMenuVisible(false);
    action();
  };

  const getHeaderTitle = () => {
    if (currentListing.status === 'rejected') return 'Tin bị từ chối';

    if (currentListing.status === 'pending') return 'Tin chờ duyệt';

    if (currentListing.status === 'hidden') return 'Tin đã ẩn';

    return 'Quản lý tin đăng';
  };

  return (
    <ScreenContainer style={styles.safeArea} keyboardAvoiding={false}>
      <HeaderBar
        title={getHeaderTitle()}
        alignTitle="left"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.headerMenuButton}
            onPress={() => setIsMenuVisible(true)}
            accessibilityLabel="Mở thao tác tin đăng"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <EllipsisVertical size={21} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={detailQuery.isRefetching}
            onRefresh={() => detailQuery.refetch()}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
      >
        {isRejected ? (
          <View style={styles.errorBanner}>
            <XCircle size={19} color={THEME_COLORS.ERROR} />
            <Typography variant="body2" colorKey="ERROR" style={styles.bannerText}>
              <Typography variant="body2" weight="BOLD" colorKey="ERROR">
                Tin chưa được duyệt.{' '}
              </Typography>
              Sửa theo góp ý bên dưới rồi gửi lại, tin không bị xoá và không phải nhập lại từ đầu.
            </Typography>
          </View>
        ) : null}

        <View style={styles.listingCard}>
          <View style={styles.thumbnail}>
            {currentListing.imageUrl && !hasImageError ? (
              <Image
                source={{ uri: currentListing.imageUrl }}
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
          <View style={styles.listingCopy}>
            <View style={styles.badges}>
              <Badge
                label={STATUS_LABELS[currentListing.status] || currentListing.status.toUpperCase()}
                variant={STATUS_VARIANTS[currentListing.status] || 'neutral'}
                size="sm"
              />
              {currentListing.isFeatured ? (
                <Badge label="NỔI BẬT" variant="featured" size="sm" />
              ) : null}
            </View>
            <Typography variant="body1" weight="BOLD" numberOfLines={2}>
              {currentListing.title}
            </Typography>
            {isRejected ? (
              <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" style={styles.listingMeta}>
                #{currentListing.id}
              </Typography>
            ) : (
              <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
                {currentListing.price.toLocaleString('vi-VN')}đ
                <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                  {' '}
                  /tháng · {currentListing.area} m²
                </Typography>
              </Typography>
            )}
          </View>
        </View>

        {isRejected ? (
          <RejectionDetails reason={currentListing.rejectionReason} />
        ) : (
          <PublishedDetails
            listing={currentListing}
            onEdit={handleEdit}
            onEditSchedule={handleEditSchedule}
            onStudentPreview={handleStudentPreview}
          />
        )}
      </ScrollView>

      <View style={[styles.bottomBar, isCompact && styles.bottomBarCompact]}>
        {currentListing.status !== 'pending' ? (
          <Button
            title={isRejected ? 'Quay lại' : 'Đánh dấu đã cho thuê'}
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
          />
        ) : null}
        <Button
          title={isRejected ? 'Sửa và gửi lại' : 'Chỉnh sửa'}
          onPress={handleEdit}
          style={currentListing.status === 'pending' ? styles.fullButton : styles.primaryButton}
        />
      </View>

      <RNModal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.menuHeader}>
              <Typography variant="h3" weight="BOLD">
                Thao tác tin đăng
              </Typography>
              <TouchableOpacity
                onPress={() => setIsMenuVisible(false)}
                accessibilityLabel="Đóng menu"
              >
                <X size={20} color={THEME_COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            </View>
            <MenuAction
              icon={Pencil}
              title="Sửa tin đăng"
              onPress={() => handleMenuAction(handleEdit)}
            />
            <MenuAction
              icon={CalendarDays}
              title="Sửa lịch xem phòng"
              onPress={() => handleMenuAction(handleEditSchedule)}
            />
            <MenuAction
              icon={Eye}
              title="Xem tin như sinh viên"
              onPress={() => handleMenuAction(handleStudentPreview)}
            />
          </View>
        </TouchableOpacity>
      </RNModal>
    </ScreenContainer>
  );
};

const RejectionDetails = ({ reason }: { reason?: string }) => (
  <View style={styles.detailCard}>
    <View style={styles.detailCardHeader}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
        LÝ DO TỪ CHỐI
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        Gần nhất
      </Typography>
    </View>
    <Reason
      title="Ảnh hoặc thông tin cần bổ sung"
      description="Vui lòng kiểm tra lại chất lượng hình ảnh và thông tin phòng trọ."
    />
    <View style={styles.adminNote}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
        GHI CHÚ TỪ QUẢN TRỊ VIÊN
      </Typography>
      <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.noteText}>
        {reason || 'Vui lòng cập nhật ảnh thực tế và kiểm tra lại thông tin chi tiết.'}
      </Typography>
    </View>
  </View>
);

const Reason = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.reasonRow}>
    <View style={styles.reasonIcon}>
      <XCircle size={17} color={THEME_COLORS.ERROR} />
    </View>
    <View style={styles.reasonCopy}>
      <Typography variant="body2" weight="BOLD">
        {title}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.reasonDescription}>
        {description}
      </Typography>
    </View>
  </View>
);

const PublishedDetails = ({
  listing,
  onEdit,
  onEditSchedule,
  onStudentPreview,
}: {
  listing: LandlordListing;
  onEdit: () => void;
  onEditSchedule: () => void;
  onStudentPreview: () => void;
}) => {
  const getVisibilityInfo = () => {
    switch (listing.status) {
      case 'published':
        return { text: 'Đang hiện với sinh viên', colorKey: 'SUCCESS' as const };
      case 'pending':
        return { text: 'Đang chờ duyệt từ UniNest', colorKey: 'WARNING' as const };
      case 'hidden':
        return { text: 'Đang tạm ẩn với sinh viên', colorKey: 'TEXT_MUTED' as const };
      default:
        return { text: 'Đã hết hạn', colorKey: 'TEXT_MUTED' as const };
    }
  };

  const visibilityInfo = getVisibilityInfo();

  return (
    <>
      <View style={styles.visibilityCard}>
        <View>
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            Trạng thái hiển thị
          </Typography>
          <Typography
            variant="body2"
            weight="BOLD"
            colorKey={visibilityInfo.colorKey}
            style={styles.visibilityValue}
          >
            {visibilityInfo.text}
          </Typography>
        </View>
        {listing.status === 'published' ? (
          <Button title="Ẩn tin" variant="outline" size="sm" onPress={() => undefined} />
        ) : null}
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
            THỐNG KÊ
          </Typography>
          <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
            Xem đầy đủ
          </Typography>
        </View>
        <View style={styles.quickStats}>
          {[
            [String(listing.viewCount || 0), 'Lượt xem'],
            [String(listing.saveCount || 0), 'Đã lưu'],
            [String(listing.contactCount || 0), 'Liên hệ'],
            ['0', 'Đặt lịch'],
          ].map(([value, label]) => (
            <View key={label} style={styles.quickStat}>
              <Typography variant="body1" weight="BOLD">
                {value}
              </Typography>
              <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                {label}
              </Typography>
            </View>
          ))}
        </View>
        {listing.status === 'published' ? (
          <View style={styles.performanceBanner}>
            <TrendingUp size={17} color={THEME_COLORS.SUCCESS} />
            <Typography variant="caption" colorKey="SUCCESS" style={styles.bannerText}>
              Tin đang hiển thị tìm kiếm cho sinh viên.
            </Typography>
          </View>
        ) : null}
      </View>

      <View style={styles.detailCard}>
        <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
          THAO TÁC NHANH
        </Typography>
        <QuickAction icon={Pencil} title="Chỉnh sửa tin đăng" onPress={onEdit} />
        <QuickAction
          icon={CalendarDays}
          title="Khung giờ cho xem phòng"
          detail={
            listing.viewingSchedule
              ? 'Đã thiết lập lịch xem phòng'
              : 'Chưa thiết lập lịch xem phòng'
          }
          onPress={onEditSchedule}
        />
        <QuickAction icon={Eye} title="Xem tin như sinh viên" onPress={onStudentPreview} />
      </View>
    </>
  );
};

const QuickAction = ({
  icon: Icon,
  title,
  detail,
  onPress,
}: {
  icon: typeof Pencil;
  title: string;
  detail?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.quickIcon}>
      <Icon size={18} color={THEME_COLORS.PRIMARY} />
    </View>
    <View style={styles.quickCopy}>
      <Typography variant="body2" weight="BOLD">
        {title}
      </Typography>
      {detail ? (
        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
          {detail}
        </Typography>
      ) : null}
    </View>
    <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
  </TouchableOpacity>
);

const MenuAction = ({
  icon: Icon,
  title,
  onPress,
}: {
  icon: typeof Pencil;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuAction} onPress={onPress} activeOpacity={0.7}>
    <Icon size={19} color={THEME_COLORS.PRIMARY} />
    <Typography variant="body1" weight="SEMIBOLD" style={styles.menuActionText}>
      {title}
    </Typography>
    <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  headerMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: 100,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    marginBottom: 14,
  },
  bannerText: { flex: 1, marginLeft: 9 },
  listingCard: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    elevation: 2,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: '#D4DBE6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingCopy: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  listingMeta: { marginTop: 5 },
  detailCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    elevation: 1,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  reasonRow: { flexDirection: 'row', paddingVertical: 12 },
  reasonIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCopy: { flex: 1, marginLeft: 10 },
  reasonDescription: { marginTop: 4 },
  adminNote: {
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.ERROR,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  noteText: { marginTop: 6 },
  visibilityCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityValue: { marginTop: 4 },
  quickStats: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderRadius: 10,
  },
  quickStat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  performanceBanner: {
    flexDirection: 'row',
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7E9CE',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  quickAction: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: { flex: 1, marginLeft: 12 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING_TOKENS.MD,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  bottomBarCompact: {
    flexDirection: 'column',
  },
  secondaryButton: { flex: 1 },
  primaryButton: { flex: 1.45 },
  fullButton: { flex: 1 },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 27, 34, 0.45)',
  },
  menuSheet: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  menuAction: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  menuActionText: { flex: 1, marginLeft: SPACING_TOKENS.SM },
});
