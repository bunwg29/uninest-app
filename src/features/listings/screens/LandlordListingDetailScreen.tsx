import { useState } from 'react';
import {
  Image,
  Modal as RNModal,
  Platform,
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
import { Button, GradientView, Modal, ScreenContainer, Typography, BackButton } from '@ui';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { useResponsiveLayout, useToast } from '@hooks';
import { useLandlordListingDetail, useLandlordListingMutation } from '../hooks';
import type { LandlordListing, ViewingSchedule } from '../types';
import { useListingPostStore } from '../store/listingPostStore';
import { LANDLORD_STATUS_LABELS, LANDLORD_STATUS_TONES, LandlordStatusPill } from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'LandlordListingDetail'>;
type PendingAction = 'hide' | 'rent' | 'unrent' | 'delete';

const ACTION_SUCCESS_MESSAGES = {
  hide: 'Đã ẩn tin đăng',
  republish: 'Đã hiển thị lại tin đăng',
  rent: 'Đã đánh dấu phòng đã cho thuê',
  unrent: 'Đã mở lại tin, phòng đang trống',
  delete: 'Đã xoá tin đăng',
};

const PENDING_ACTION_COPY: Record<
  PendingAction,
  { title: string; description: string; confirmText: string }
> = {
  hide: {
    title: 'Ẩn tin đăng?',
    description: 'Tin đăng sẽ không còn hiển thị với người tìm phòng.',
    confirmText: 'Ẩn tin',
  },
  rent: {
    title: 'Đánh dấu đã cho thuê?',
    description:
      'Tin sẽ ngừng hiển thị trong tìm kiếm và các lịch hẹn đang chờ hoặc đã xác nhận sẽ hết hạn.',
    confirmText: 'Đã cho thuê',
  },
  unrent: {
    title: 'Đánh dấu chưa cho thuê?',
    description: 'Tin sẽ hiển thị lại với sinh viên và nhận yêu cầu xem phòng mới.',
    confirmText: 'Chưa cho thuê',
  },
  delete: {
    title: 'Xoá tin đăng?',
    description: 'Tin đăng sẽ bị xoá khỏi danh sách của bạn và không thể khôi phục.',
    confirmText: 'Xoá tin',
  },
};

const MONO_FONT = Platform.select({ ios: 'Courier New', default: 'monospace' });

const countViewingSlots = (schedule?: ViewingSchedule) =>
  schedule
    ? Object.values(schedule).reduce(
        (total, slot) =>
          total + Number(slot.morning) + Number(slot.afternoon) + Number(slot.evening),
        0
      )
    : 0;

export const LandlordListingDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { listing } = route.params;

  const detailQuery = useLandlordListingDetail(listing.id, listing);
  const currentListing = detailQuery.data ?? listing;
  const [hasImageError, setHasImageError] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { isCompact } = useResponsiveLayout();
  const toast = useToast();
  const listingMutation = useLandlordListingMutation();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const runAction = (action: 'hide' | 'republish' | 'rent' | 'unrent' | 'delete') => {
    if (listingMutation.isPending) return;

    listingMutation.mutate(
      { action, id: currentListing.id },
      {
        onSuccess: () => {
          setPendingAction(null);
          toast.success(ACTION_SUCCESS_MESSAGES[action]);

          if (action === 'delete') navigation.goBack();
        },
        onError: (error) => {
          setPendingAction(null);
          toast.error(error instanceof Error ? error.message : 'Không thể cập nhật tin đăng');
        },
      }
    );
  };

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

    if (currentListing.status === 'expired') return 'Tin đã cho thuê';

    return 'Quản lý tin đăng';
  };

  const getVisibilityInfo = () => {
    switch (currentListing.status) {
      case 'published':
        return { text: 'Đang hiện với sinh viên', color: THEME_COLORS.SUCCESS };
      case 'pending':
        return { text: 'Đang chờ duyệt từ UniNest', color: THEME_COLORS.WARNING };
      case 'hidden':
        return { text: 'Đang tạm ẩn với sinh viên', color: THEME_COLORS.TEXT_MUTED };
      case 'paused':
        return { text: 'Đang ngừng nhận yêu cầu mới', color: THEME_COLORS.WARNING };
      case 'expired':
        return { text: 'Phòng đã cho thuê', color: THEME_COLORS.TEXT_MUTED };
      default:
        return { text: 'Không hiển thị với sinh viên', color: THEME_COLORS.TEXT_MUTED };
    }
  };

  const visibilityInfo = getVisibilityInfo();
  const canHide = currentListing.status === 'published' || currentListing.status === 'paused';
  const canRepublish = currentListing.status === 'hidden';
  const bottomPrimaryStyle = isRejected ? styles.primaryButtonWide : styles.primaryButton;

  return (
    <ScreenContainer style={styles.safeArea} keyboardAvoiding={false}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} accessibilityLabel="Quay lại" />

        <Typography variant="h3" weight="SEMIBOLD" numberOfLines={1} style={styles.headerTitle}>
          {getHeaderTitle()}
        </Typography>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsMenuVisible(true)}
          accessibilityLabel="Mở thao tác tin đăng"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <EllipsisVertical size={20} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

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
              <Typography
                variant="body2"
                weight="SEMIBOLD"
                colorKey="ERROR"
                style={styles.bodyText}
              >
                Tin chưa được duyệt.
              </Typography>
              {
                ' Sửa theo góp ý bên dưới rồi gửi lại — tin không bị xoá, bạn không phải nhập lại từ đầu.'
              }
            </Typography>
          </View>
        ) : null}

        <View style={[styles.card, styles.listingCard]}>
          <View style={styles.listingRow}>
            <View style={[styles.thumbnail, isRejected && styles.thumbnailSmall]}>
              {currentListing.imageUrl && !hasImageError ? (
                <Image
                  source={{ uri: currentListing.imageUrl }}
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

            <View style={styles.listingCopy}>
              <View style={styles.badges}>
                <LandlordStatusPill
                  label={LANDLORD_STATUS_LABELS[currentListing.status] ?? currentListing.status}
                  tone={LANDLORD_STATUS_TONES[currentListing.status] ?? 'neutral'}
                />
                {currentListing.isFeatured ? (
                  <LandlordStatusPill label="Nổi bật" tone="featured" />
                ) : null}
              </View>

              <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2}>
                {currentListing.title}
              </Typography>

              {isRejected ? (
                <Typography
                  variant="caption"
                  colorKey="TEXT_PLACEHOLDER"
                  numberOfLines={1}
                  style={styles.listingCode}
                >
                  #{currentListing.id}
                </Typography>
              ) : (
                <View style={styles.priceRow}>
                  <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
                    {currentListing.price.toLocaleString('vi-VN')}đ
                  </Typography>
                  <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                    /tháng · {currentListing.area} m²
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {isRejected ? null : (
            <>
              <View style={styles.divider} />

              <View style={styles.visibilityRow}>
                <View>
                  <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                    Trạng thái hiển thị
                  </Typography>
                  <Typography
                    variant="body2"
                    weight="SEMIBOLD"
                    color={visibilityInfo.color}
                    style={styles.bodyText}
                  >
                    {visibilityInfo.text}
                  </Typography>
                </View>

                {canHide ? (
                  <Button
                    title="Ẩn tin"
                    variant="outline"
                    size="sm"
                    disabled={listingMutation.isPending}
                    onPress={() => setPendingAction('hide')}
                    textStyle={styles.bodyText}
                  />
                ) : null}
                {canRepublish ? (
                  <Button
                    title="Hiện lại tin"
                    variant="outline"
                    size="sm"
                    disabled={listingMutation.isPending}
                    onPress={() => runAction('republish')}
                    textStyle={styles.bodyText}
                  />
                ) : null}
              </View>
            </>
          )}
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
        {isRejected ? (
          <Button
            title="Xoá tin"
            variant="outline"
            onPress={() => setPendingAction('delete')}
            style={styles.secondaryButton}
          />
        ) : null}
        {currentListing.status === 'published' || currentListing.status === 'paused' ? (
          <Button
            title="Đánh dấu đã cho thuê"
            variant="outline"
            onPress={() => setPendingAction('rent')}
            style={styles.secondaryButton}
          />
        ) : null}
        {currentListing.status === 'expired' ? (
          <Button
            title="Đánh dấu chưa cho thuê"
            variant="outline"
            onPress={() => setPendingAction('unrent')}
            style={styles.secondaryButton}
          />
        ) : null}
        <Button
          title={isRejected ? 'Sửa và gửi lại' : 'Chỉnh sửa'}
          onPress={handleEdit}
          style={bottomPrimaryStyle}
        />
      </View>

      <Modal
        isVisible={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title={pendingAction ? PENDING_ACTION_COPY[pendingAction].title : ''}
        description={pendingAction ? PENDING_ACTION_COPY[pendingAction].description : ''}
        confirmText={pendingAction ? PENDING_ACTION_COPY[pendingAction].confirmText : ''}
        confirmVariant={
          pendingAction === 'hide' || pendingAction === 'delete' ? 'danger' : 'primary'
        }
        onConfirm={() => pendingAction && runAction(pendingAction)}
        isConfirmLoading={listingMutation.isPending}
      />

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
  <View style={[styles.card, styles.sectionCard]}>
    <View style={styles.sectionHeader}>
      <Typography
        variant="caption"
        weight="SEMIBOLD"
        colorKey="TEXT_PLACEHOLDER"
        style={styles.eyebrow}
      >
        LÝ DO TỪ CHỐI
      </Typography>
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        Gần nhất
      </Typography>
    </View>

    <View style={styles.divider} />

    <Reason
      title="Ảnh hoặc thông tin cần bổ sung"
      description="Vui lòng kiểm tra lại chất lượng hình ảnh và thông tin phòng trọ."
    />

    <View style={styles.divider} />

    <View style={styles.adminNote}>
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        GHI CHÚ TỪ QUẢN TRỊ VIÊN
      </Typography>
      <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.bodyText}>
        {reason || 'Vui lòng cập nhật ảnh thực tế và kiểm tra lại thông tin chi tiết.'}
      </Typography>
    </View>
  </View>
);

const Reason = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.reasonRow}>
    <View style={styles.reasonIcon}>
      <X size={14} color={THEME_COLORS.ERROR} strokeWidth={2.4} />
    </View>
    <View style={styles.reasonCopy}>
      <Typography variant="body2" weight="SEMIBOLD" style={styles.reasonTitle}>
        {title}
      </Typography>
      <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.bodyText}>
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
  const slotCount = countViewingSlots(listing.viewingSchedule);

  return (
    <>
      <View style={[styles.card, styles.sectionCard]}>
        <View style={styles.sectionHeader}>
          <Typography
            variant="caption"
            weight="SEMIBOLD"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.eyebrow}
          >
            THỐNG KÊ
          </Typography>
          <Typography
            variant="body2"
            weight="SEMIBOLD"
            colorKey="PRIMARY_DARK"
            style={styles.bodyText}
          >
            Xem đầy đủ
          </Typography>
        </View>

        <View style={styles.quickStats}>
          {[
            [String(listing.viewCount || 0), 'Lượt xem'],
            [String(listing.saveCount || 0), 'Đã lưu'],
            [String(listing.contactCount || 0), 'Liên hệ'],
            [String(listing.bookingCount || 0), 'Đặt lịch'],
          ].map(([value, label], index) => (
            <View key={label} style={styles.quickStatWrapper}>
              {index > 0 ? <View style={styles.quickStatDivider} /> : null}
              <View style={styles.quickStat}>
                <Typography variant="body1" weight="BOLD" style={styles.quickStatValue}>
                  {value}
                </Typography>
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  {label}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {listing.status === 'published' ? (
          <View style={styles.performanceBanner}>
            <TrendingUp size={16} color={THEME_COLORS.SUCCESS} style={styles.performanceIcon} />
            <Typography variant="body2" colorKey="SUCCESS" style={styles.performanceText}>
              Tin đang hiển thị tìm kiếm cho sinh viên.
            </Typography>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, styles.sectionCard]}>
        <Typography
          variant="caption"
          weight="SEMIBOLD"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.eyebrow}
        >
          THAO TÁC NHANH
        </Typography>

        <View style={styles.divider} />

        <QuickAction icon={Pencil} title="Chỉnh sửa tin đăng" onPress={onEdit} />
        <View style={styles.divider} />
        <QuickAction
          icon={CalendarDays}
          title="Khung giờ cho xem phòng"
          detail={
            slotCount > 0 ? `Đang bật ${slotCount} khung / tuần` : 'Chưa thiết lập lịch xem phòng'
          }
          onPress={onEditSchedule}
        />
        <View style={styles.divider} />
        <QuickAction
          icon={Eye}
          title="Xem như sinh viên nhìn thấy"
          tone="success"
          onPress={onStudentPreview}
        />
      </View>
    </>
  );
};

const QuickAction = ({
  icon: Icon,
  title,
  detail,
  tone = 'info',
  onPress,
}: {
  icon: typeof Pencil;
  title: string;
  detail?: string;
  tone?: 'info' | 'success';
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View
      style={[
        styles.quickIcon,
        {
          backgroundColor:
            tone === 'info' ? THEME_COLORS.PRIMARY_LIGHT : THEME_COLORS.SUCCESS_LIGHT,
        },
      ]}
    >
      <Icon size={18} color={tone === 'info' ? THEME_COLORS.PRIMARY : THEME_COLORS.SUCCESS} />
    </View>
    <View style={styles.quickCopy}>
      <Typography variant="body2" weight="SEMIBOLD" style={styles.bodyText}>
        {title}
      </Typography>
      {detail ? (
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {detail}
        </Typography>
      ) : null}
    </View>
    <ChevronRight size={17} color={THEME_COLORS.TEXT_PLACEHOLDER} />
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  headerTitle: { flex: 1 },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: 100,
    gap: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  bodyText: { fontSize: 13, lineHeight: 20 },
  eyebrow: { fontSize: 11, lineHeight: 15, letterSpacing: 0.6 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 20 },
  card: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  listingCard: { gap: 14 },
  sectionCard: { gap: 12 },
  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
  },
  thumbnailSmall: { width: 64, height: 64 },
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listingCopy: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  listingCode: { fontFamily: MONO_FONT, letterSpacing: 0.2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonRow: { flexDirection: 'row', gap: 10 },
  reasonIcon: {
    width: 26,
    height: 26,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCopy: { flex: 1, gap: 2 },
  reasonTitle: { lineHeight: 22 },
  adminNote: {
    gap: 6,
    paddingLeft: 15,
    paddingRight: 12,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.ERROR,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  quickStats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  quickStatWrapper: { flex: 1, flexDirection: 'row' },
  quickStatDivider: { width: 1, backgroundColor: THEME_COLORS.BORDER },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 16, lineHeight: 24 },
  performanceBanner: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.SUCCESS_BORDER,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  performanceIcon: { marginTop: 2 },
  performanceText: { flex: 1, fontSize: 13, lineHeight: 20 },
  quickAction: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: { flex: 1 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  bottomBarCompact: {
    flexDirection: 'column',
  },
  secondaryButton: { flex: 1, height: 48 },
  primaryButton: { flex: 1, height: 48 },
  primaryButtonWide: { flex: 2, height: 48 },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP,
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
