import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Clock3,
  Eye,
  Flag,
  Footprints,
  LayoutTemplate,
  Heart,
  ImageOff,
  MapPin,
  MessageSquare,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppError, formatVND } from '@core';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import {
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  SPACING_TOKENS,
  THEME_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
import { Avatar, Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useAuth } from '@features/auth';
import { ImageViewerModal } from '@features/chat/components/ImageViewerModal';
import { useOpenListingChat } from '@features/chat/hooks/useOpenListingChat';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '@features/comparison';
import {
  SEARCH_SCHOOLS,
  estimateWalkingMinutes,
  formatDistanceMeters,
  haversineMeters,
  useSearchStore,
  useToggleFavorite,
} from '@features/search';
import { useRecentlyViewedStore } from '@features/recommendations';
import { useListingDetail, useRecordListingView, useReportListing } from '../hooks';
import {
  AmenitiesModal,
  ListingLocationMap,
  ReportListingModal,
  getAmenityIcon,
  type ListingReportReason,
} from '../components';
import type { ListingAvailability, ListingDetail, ListingDetailImage } from '../types';
import { ROOM_TYPE_OPTIONS } from '../types/constants';

type DetailRoute = RouteProp<RootStackParamList, 'ListingDetail'>;
type DetailNavigation = NativeStackNavigationProp<RootStackParamList>;

const MAX_CONTENT_WIDTH = 720;
const MAX_GALLERY_HEIGHT = 360;
const GALLERY_ASPECT_RATIO = 0.72;
const SECTION_SPACING = 20;
const OVERLAY_TOP_OFFSET = 12;
const ROUND_BUTTON_SIZE = 40;
const ACTION_BUTTON_SIZE = 48;
const VISIBLE_AMENITY_COUNT = 6;
const ACTION_BAR_HEIGHT = 72;

const AVAILABILITY_BADGES: Record<
  ListingAvailability,
  { label: string; variant: 'available' | 'holding' | 'neutral' }
> = {
  available: { label: 'CÒN TRỐNG', variant: 'available' },
  holding: { label: 'ĐANG GIỮ CHỖ', variant: 'holding' },
  rented: { label: 'ĐÃ CHO THUÊ', variant: 'neutral' },
  paused: { label: 'NGỪNG NHẬN YÊU CẦU', variant: 'neutral' },
};

const formatShortDate = (value: string) => {
  const date = new Date(value);

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const ListingDetailScreen = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNavigation>();
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const listingId = route.params.id;
  const detailQuery = useListingDetail(listingId);
  const viewMutation = useRecordListingView(listingId);
  const reportMutation = useReportListing(listingId);
  const toggleFavorite = useToggleFavorite();
  const { openChat, isOpening } = useOpenListingChat();
  const isStudent = role === 'student';
  const recordedListingId = useRef<string | null>(null);
  const recordRecentlyViewed = useRecentlyViewedStore((state) => state.recordView);
  const comparisonItems = useComparisonStore((state) => state.items);
  const addComparison = useComparisonStore((state) => state.add);
  const appliedFilters = useSearchStore((state) => state.appliedFilters);
  const isCompared = comparisonItems.some((item) => item.id === listingId);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isAmenitiesVisible, setIsAmenitiesVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const columnWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const galleryHeight = Math.min(
    Math.round(columnWidth * GALLERY_ASPECT_RATIO),
    MAX_GALLERY_HEIGHT
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      return;
    }

    navigation.navigate('Main');
  };

  useEffect(() => {
    if (!detailQuery.data || recordedListingId.current === listingId) {
      return;
    }

    recordedListingId.current = listingId;
    viewMutation.mutate();

    if (isStudent) {
      recordRecentlyViewed(listingId);
    }
  }, [detailQuery.data, isStudent, listingId, recordRecentlyViewed, viewMutation]);

  const handleCompare = () => {
    if (!detailQuery.data) {
      return;
    }

    if (isCompared) {
      navigation.navigate('Comparison');

      return;
    }

    const result = addComparison(detailQuery.data);

    if (result === 'limit-reached') {
      toast.warning(
        `Danh sách so sánh đã đạt giới hạn ${MAX_COMPARISON_ITEMS} phòng. Hãy bỏ bớt một phòng để thêm phòng khác.`
      );
      navigation.navigate('Comparison');

      return;
    }

    toast.success('Đã thêm tin vào danh sách so sánh');
  };

  const handleToggleFavorite = () => {
    if (!detailQuery.data) {
      return;
    }

    if (!isStudent) {
      toast.info('Chỉ Sinh viên mới có thể lưu phòng.');

      return;
    }

    toggleFavorite.mutate({
      listingId,
      isSaved: detailQuery.data.isFavorite,
    });
  };

  const handleShare = () => {
    if (!detailQuery.data) {
      return;
    }

    void Share.share({
      message: `${detailQuery.data.title} - ${formatVND(detailQuery.data.price)}/tháng. Xem trên UniNest.`,
    });
  };

  const handleHold = () => {
    const booking = detailQuery.data?.myBooking;

    if (!booking || booking.status !== 'confirmed' || new Date(booking.startTime) > new Date()) {
      return;
    }

    navigation.navigate('BookingHold', { id: booking.id });
  };

  const handleSubmitReport = (reason: ListingReportReason, note: string) => {
    reportMutation.mutate(
      { reason, note },
      {
        onSuccess: () => {
          setIsReportVisible(false);
          toast.success('Đã gửi báo cáo. Cảm ơn bạn đã giúp UniNest an toàn hơn.');
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Không thể gửi báo cáo'),
      }
    );
  };

  const orderedImages = useMemo(
    () =>
      [...(detailQuery.data?.images ?? [])].sort(
        (first, second) => Number(second.isCover) - Number(first.isCover)
      ),
    [detailQuery.data?.images]
  );

  if (detailQuery.isLoading) {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Chi tiết phòng" onBack={handleBack} />
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.stateText}>
            Đang tải thông tin phòng...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    const isNotFound =
      detailQuery.error instanceof AppError && detailQuery.error.statusCode === 404;

    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Chi tiết phòng" onBack={handleBack} />
        <View style={styles.stateContainer}>
          <ImageOff size={44} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <Typography variant="h3" weight="BOLD" align="center" style={styles.stateText}>
            {isNotFound ? 'Không tìm thấy tin đăng' : 'Không thể tải thông tin phòng'}
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            {isNotFound
              ? 'Tin đăng không tồn tại hoặc bạn không có quyền xem.'
              : 'Vui lòng kiểm tra kết nối và thử lại.'}
          </Typography>
          <Button title="Thử lại" onPress={() => void detailQuery.refetch()} style={styles.retry} />
        </View>
      </ScreenContainer>
    );
  }

  const listing = detailQuery.data;
  const hasCoordinates =
    Number.isFinite(listing.location?.latitude) && Number.isFinite(listing.location?.longitude);
  const roomTypeLabel =
    ROOM_TYPE_OPTIONS.find((option) => option.value === listing.roomType)?.label ?? 'Chưa cập nhật';
  const availabilityBadge = AVAILABILITY_BADGES[listing.availability];
  const isHolding = listing.availability === 'holding';
  const myBooking = listing.myBooking ?? null;
  const canBook = listing.availability === 'available' && !myBooking;
  const canHold =
    listing.availability === 'available' &&
    myBooking?.status === 'confirmed' &&
    new Date(myBooking.startTime) <= new Date();
  const holdHint = getHoldHint(listing.availability, myBooking);
  const reference = getDistanceReference(appliedFilters);
  const distanceMeters =
    reference && hasCoordinates
      ? haversineMeters(reference, listing.location)
      : (listing.distanceMeters ?? null);
  const visibleAmenities = listing.amenities.slice(0, VISIBLE_AMENITY_COUNT);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isStudent ? ACTION_BAR_HEIGHT + insets.bottom + SPACING_TOKENS.LG : 0,
        }}
      >
        <View style={styles.column}>
          <ListingImageGallery
            images={orderedImages}
            width={columnWidth}
            height={galleryHeight}
            onPressImage={setViewerIndex}
          />

          <View style={styles.content}>
            <View style={styles.badgeRow}>
              <AvailabilityBadge
                label={availabilityBadge.label}
                variant={availabilityBadge.variant}
              />
            </View>

            <Typography variant="h1" weight="BOLD" style={styles.title}>
              {listing.title}
            </Typography>

            <View style={styles.priceRow}>
              <Typography variant="h2" weight="BOLD" colorKey="PRIMARY_DARK" style={styles.price}>
                {formatHeadlinePrice(listing.price)}
              </Typography>
              <Typography variant="body2" colorKey="TEXT_MUTED">
                /tháng
              </Typography>
            </View>

            <View style={styles.metaRow}>
              <InfoPill label={formatMeasuredValue(listing.area, 'm²')} icon="area" />
              <InfoPill label={formatMeasuredValue(listing.maxOccupants, 'người')} icon="users" />
              <InfoPill label={roomTypeLabel} icon="plus" />
              {listing.viewCount !== null ? (
                <InfoPill label={formatMeasuredValue(listing.viewCount, 'lượt xem')} icon="eye" />
              ) : null}
            </View>

            <View style={styles.addressRow}>
              <MapPin size={16} color={THEME_COLORS.TEXT_MUTED} style={styles.addressIcon} />
              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.flexText}>
                {listing.address?.fullAddress || 'Chưa cập nhật địa chỉ'}
              </Typography>
            </View>

            {distanceMeters !== null && reference ? (
              <View style={styles.distancePill}>
                <Footprints size={15} color={THEME_COLORS.PRIMARY_DARK} />
                <Typography
                  variant="body2"
                  weight="SEMIBOLD"
                  colorKey="PRIMARY_DARK"
                  style={styles.distanceText}
                >
                  {`Cách ${reference.label} ${formatDistanceMeters(distanceMeters)} · ~${estimateWalkingMinutes(distanceMeters)} phút đi bộ`}
                </Typography>
              </View>
            ) : null}

            {listing.averageRating !== null && Number.isFinite(listing.averageRating) ? (
              <View style={styles.ratingRow}>
                <Star size={17} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
                <Typography variant="body2" weight="SEMIBOLD">
                  {formatRating(listing.averageRating)}
                </Typography>
              </View>
            ) : null}

            {isHolding && listing.hold ? (
              <View style={styles.holdNotice}>
                <Clock3 size={18} color={THEME_COLORS.WARNING} />
                <Typography variant="body2" color={THEME_COLORS.WARNING} style={styles.flexText}>
                  {`Phòng đang được một bạn khác giữ chỗ đến ${formatShortDate(listing.hold.expiresAt)}. Nếu bạn ấy không hoàn tất, phòng sẽ mở lại. Bạn vẫn nhắn tin hỏi Chủ trọ được.`}
                </Typography>
              </View>
            ) : null}

            <Section title="Tiện ích">
              {visibleAmenities.length > 0 ? (
                <>
                  <View style={styles.amenityGrid}>
                    {visibleAmenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity.id);

                      return (
                        <View key={amenity.id} style={styles.amenityItem}>
                          <Icon size={19} color={THEME_COLORS.TEXT_SECONDARY} />
                          <Typography
                            variant="body2"
                            colorKey="TEXT_SECONDARY"
                            numberOfLines={1}
                            style={styles.flexText}
                          >
                            {amenity.name}
                          </Typography>
                        </View>
                      );
                    })}
                  </View>
                  {listing.amenities.length > VISIBLE_AMENITY_COUNT ? (
                    <TouchableOpacity
                      onPress={() => setIsAmenitiesVisible(true)}
                      style={styles.linkButton}
                    >
                      <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                        {`Xem tất cả ${listing.amenities.length} tiện ích`}
                      </Typography>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : (
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  Chưa có thông tin tiện ích.
                </Typography>
              )}
            </Section>

            <Section title="Mô tả">
              <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.description}>
                {listing.description?.trim() || 'Chủ trọ chưa bổ sung mô tả.'}
              </Typography>
            </Section>

            <Section title="Chi phí và thông tin phòng">
              <DetailRow label="Loại phòng" value={roomTypeLabel} />
              <DetailRow label="Tiền cọc" value={formatNullablePrice(listing.deposit)} />
              <DetailRow
                label="Giá điện"
                value={formatNullablePrice(listing.electricPrice, ' / kWh')}
              />
              <DetailRow
                label="Giá nước"
                value={formatNullablePrice(listing.waterPrice, ' / m³')}
              />
            </Section>

            <Section title="Vị trí">
              {hasCoordinates ? (
                <View style={styles.mapWrapper}>
                  <ListingLocationMap
                    latitude={listing.location.latitude}
                    longitude={listing.location.longitude}
                    title={listing.title}
                    description={listing.address?.fullAddress}
                  />
                </View>
              ) : (
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  Chưa có tọa độ phòng trọ.
                </Typography>
              )}
            </Section>

            <Section title="Chủ trọ">
              {listing.landlord ? (
                <View style={styles.landlordRow}>
                  <Avatar
                    uri={listing.landlord.avatarUrl}
                    name={listing.landlord.fullName}
                    size="lg"
                  />
                  <View style={styles.landlordInfo}>
                    <View style={styles.landlordNameRow}>
                      <Typography variant="body1" weight="BOLD">
                        {listing.landlord.fullName}
                      </Typography>
                      {listing.landlord.isVerified ? (
                        <ShieldCheck size={17} color={THEME_COLORS.SUCCESS} />
                      ) : null}
                    </View>
                    {listing.landlord.bio ? (
                      <Typography variant="caption" colorKey="TEXT_MUTED">
                        {listing.landlord.bio}
                      </Typography>
                    ) : null}
                  </View>
                </View>
              ) : (
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  Chưa có thông tin chủ trọ.
                </Typography>
              )}
            </Section>

            <Section title="Đánh giá">
              {listing.averageRating === null || !Number.isFinite(listing.averageRating) ? (
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  Chưa có đánh giá cho tin đăng này.
                </Typography>
              ) : (
                <View style={styles.ratingRow}>
                  <Star size={20} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
                  <Typography variant="h3" weight="BOLD">
                    {formatRating(listing.averageRating)}
                  </Typography>
                </View>
              )}
            </Section>

            {isStudent ? (
              <TouchableOpacity
                onPress={() => setIsReportVisible(true)}
                style={styles.reportButton}
                accessibilityRole="button"
              >
                <Flag size={16} color={THEME_COLORS.TEXT_MUTED} />
                <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                  Báo cáo tin đăng này
                </Typography>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.overlayHeader, { paddingTop: insets.top + OVERLAY_TOP_OFFSET }]}
      >
        <View style={styles.overlayRow}>
          <RoundButton label="Quay lại" onPress={handleBack}>
            <ArrowLeft size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </RoundButton>
          <View style={styles.overlayActions}>
            <RoundButton label="Chia sẻ" onPress={handleShare}>
              <Share2 size={19} color={THEME_COLORS.TEXT_PRIMARY} />
            </RoundButton>
            <RoundButton
              label={listing.isFavorite ? 'Bỏ lưu phòng' : 'Lưu phòng'}
              onPress={handleToggleFavorite}
            >
              <Heart
                size={19}
                color={listing.isFavorite ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_PRIMARY}
                fill={listing.isFavorite ? THEME_COLORS.ERROR : 'transparent'}
              />
            </RoundButton>
            <RoundButton label="So sánh phòng" onPress={handleCompare}>
              <Scale
                size={19}
                color={isCompared ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
              />
              {comparisonItems.length > 0 ? (
                <View style={styles.compareCount}>
                  <Typography
                    variant="tiny"
                    weight="BOLD"
                    color={THEME_COLORS.WHITE}
                    style={styles.compareCountText}
                  >
                    {comparisonItems.length}
                  </Typography>
                </View>
              ) : null}
            </RoundButton>
          </View>
        </View>
      </View>

      {isStudent ? (
        <View
          style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.SM) }]}
        >
          {isHolding && listing.hold ? (
            <View style={styles.holdStrip}>
              <Clock3 size={15} color={THEME_COLORS.WARNING} />
              <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.WARNING}>
                {`Phòng được giữ chỗ đến ${formatShortDate(listing.hold.expiresAt)} · còn ${listing.hold.daysLeft} ngày`}
              </Typography>
            </View>
          ) : null}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => void openChat(listing.id)}
              disabled={isOpening}
              accessibilityRole="button"
              accessibilityLabel="Nhắn tin với Chủ trọ"
            >
              {isOpening ? (
                <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
              ) : (
                <MessageSquare size={21} color={THEME_COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
            <Button
              title={myBooking ? 'Xem lịch hẹn' : 'Đặt lịch xem'}
              variant="outline"
              disabled={!canBook && !myBooking}
              onPress={() =>
                myBooking
                  ? navigation.navigate('BookingDetail', { id: myBooking.id })
                  : navigation.navigate('BookingNew', { resourceId: listing.id })
              }
              style={[styles.actionFlex, styles.outlineAction]}
              textStyle={styles.outlineActionText}
            />
            <Button
              title={myBooking?.status === 'holding' ? 'Đang giữ chỗ' : 'Giữ chỗ'}
              disabled={!canHold}
              onPress={handleHold}
              style={styles.actionFlex}
            />
          </View>
          {holdHint ? (
            <Typography
              variant="caption"
              colorKey="TEXT_MUTED"
              align="center"
              style={styles.holdHint}
            >
              {holdHint}
            </Typography>
          ) : null}
        </View>
      ) : null}

      <ImageViewerModal
        isVisible={viewerIndex !== null}
        imageUrls={orderedImages.map((image) => image.url)}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
      <AmenitiesModal
        isVisible={isAmenitiesVisible}
        amenities={listing.amenities}
        onClose={() => setIsAmenitiesVisible(false)}
      />
      <ReportListingModal
        isVisible={isReportVisible}
        isSubmitting={reportMutation.isPending}
        onClose={() => setIsReportVisible(false)}
        onSubmit={handleSubmitReport}
      />
    </View>
  );
};

const getHoldHint = (
  availability: ListingDetail['availability'],
  myBooking: ListingDetail['myBooking']
) => {
  if (availability !== 'available') return null;

  if (!myBooking) return 'Đặt lịch và đến xem phòng để có thể giữ chỗ.';

  if (myBooking.status === 'pending') return 'Đang chờ Chủ trọ xác nhận lịch xem phòng.';

  if (myBooking.status === 'confirmed' && new Date(myBooking.startTime) > new Date()) {
    return 'Bạn có thể giữ chỗ sau khi đã đến xem phòng.';
  }

  return null;
};

const getDistanceReference = (filters: {
  latitude?: number;
  longitude?: number;
  schoolId?: string;
}) => {
  if (filters.latitude === undefined || filters.longitude === undefined) {
    return null;
  }

  const school = SEARCH_SCHOOLS.find((item) => item.id === filters.schoolId);

  return {
    latitude: filters.latitude,
    longitude: filters.longitude,
    label: school ? school.name : 'vị trí của bạn',
  };
};

const RoundButton = ({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.roundButton}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    {children}
  </TouchableOpacity>
);

const ListingImageGallery = ({
  images,
  width,
  height,
  onPressImage,
}: {
  images: ListingDetailImage[];
  width: number;
  height: number;
  onPressImage: (index: number) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={[styles.imageFallback, { width, height }]}>
        <ImageOff size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.stateText}>
          Tin đăng chưa có hình ảnh.
        </Typography>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        data={images}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index }) => (
          <GalleryImage
            image={item}
            width={width}
            height={height}
            onPress={() => onPressImage(index)}
          />
        )}
      />
      <View style={styles.imageCounter}>
        <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
          {`${activeIndex + 1} / ${images.length}`}
        </Typography>
      </View>
    </View>
  );
};

const GalleryImage = ({
  image,
  width,
  height,
  onPress,
}: {
  image: ListingDetailImage;
  width: number;
  height: number;
  onPress: () => void;
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return hasError || !image.url ? (
    <View style={[styles.imageFallback, { width, height }]}>
      <ImageOff size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.stateText}>
        Không thể tải hình ảnh.
      </Typography>
    </View>
  ) : (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[styles.galleryImageWrapper, { width, height }]}
      accessibilityLabel="Xem ảnh toàn màn hình"
    >
      <Image
        source={{ uri: image.url }}
        style={styles.galleryImage}
        resizeMode="cover"
        onError={() => setHasError(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading ? (
        <ActivityIndicator
          pointerEvents="none"
          style={styles.imageLoader}
          color={THEME_COLORS.PRIMARY}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Typography variant="h3" weight="BOLD" style={styles.sectionTitle}>
      {title}
    </Typography>
    {children}
  </View>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Typography variant="body2" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="body2" weight="SEMIBOLD" style={styles.detailValue}>
      {value}
    </Typography>
  </View>
);

const INFO_PILL_ICONS = {
  area: LayoutTemplate,
  users: Users,
  plus: Plus,
  eye: Eye,
} as const;

const InfoPill = ({ label, icon }: { label: string; icon: keyof typeof INFO_PILL_ICONS }) => {
  const Icon = INFO_PILL_ICONS[icon];

  return (
    <View style={styles.infoPill}>
      <Icon size={16} color={THEME_COLORS.TEXT_MUTED} />
      <Typography variant="label" weight="REGULAR" colorKey="TEXT_MUTED">
        {label}
      </Typography>
    </View>
  );
};

const AvailabilityBadge = ({
  label,
  variant,
}: {
  label: string;
  variant: 'available' | 'holding' | 'neutral';
}) => {
  const palette = AVAILABILITY_PALETTES[variant];

  return (
    <View
      style={[
        styles.availabilityBadge,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
      ]}
    >
      <Typography
        variant="caption"
        weight="SEMIBOLD"
        color={palette.textColor}
        style={styles.badgeText}
      >
        {label}
      </Typography>
    </View>
  );
};

const AVAILABILITY_PALETTES = {
  available: {
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    borderColor: OVERLAY_COLORS.SUCCESS_BORDER,
    textColor: THEME_COLORS.SUCCESS,
  },
  holding: {
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    borderColor: THEME_COLORS.WARNING_LIGHT,
    textColor: THEME_COLORS.WARNING,
  },
  neutral: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.SURFACE_MUTED,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
} as const;

const formatHeadlinePrice = (value: number): string =>
  Number.isFinite(value) ? `${value.toLocaleString('vi-VN')}đ` : 'Chưa cập nhật';

const formatRating = (value: number): string => value.toFixed(1).replace('.', ',');

const formatNullablePrice = (value: number | null | undefined, suffix = ''): string =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 'Chưa cập nhật'
    : `${formatVND(value)}${suffix}`;

const formatMeasuredValue = (value: number | null | undefined, unit: string): string =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 'Chưa cập nhật'
    : `${value} ${unit}`;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  stateText: { marginTop: SPACING_TOKENS.SM },
  retry: { marginTop: SPACING_TOKENS.LG, minWidth: 140 },
  overlayHeader: { position: 'absolute', top: 0, left: 0, right: 0 },
  overlayRow: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  overlayActions: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  roundButton: {
    width: ROUND_BUTTON_SIZE,
    height: ROUND_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  compareCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareCountText: { lineHeight: 13 },
  galleryImageWrapper: { backgroundColor: THEME_COLORS.SURFACE_MUTED },
  galleryImage: { width: '100%', height: '100%' },
  imageLoader: { ...StyleSheet.absoluteFill },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  imageCounter: {
    position: 'absolute',
    right: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    bottom: SPACING_TOKENS.XL - SPACING_TOKENS.XS,
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.COUNTER_BADGE,
  },
  content: {
    marginTop: -SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SECTION_SPACING,
    paddingBottom: SPACING_TOKENS.XL,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  badgeRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  availabilityBadge: {
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  badgeText: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.CAPTION_SM,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.TINY,
    letterSpacing: 0.5,
  },
  title: {
    marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XXS,
    letterSpacing: -0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.SM,
  },
  price: { fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.XL + 2, letterSpacing: -0.2 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: SECTION_SPACING,
    rowGap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.SM,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM - SPACING_TOKENS.XXS,
  },
  addressRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM - SPACING_TOKENS.XXS,
    marginTop: SPACING_TOKENS.SM,
  },
  addressIcon: { marginTop: SPACING_TOKENS.XS },
  flexText: { flex: 1 },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XXS,
    height: 30,
    paddingHorizontal: SPACING_TOKENS.SM + SPACING_TOKENS.XXS,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  distanceText: { fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS + SPACING_TOKENS.XXS,
    marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XXS,
  },
  holdNotice: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.WARNING,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  section: {
    marginTop: SECTION_SPACING,
    paddingTop: SECTION_SPACING,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
  },
  sectionTitle: {
    marginBottom: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.XL,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.H2,
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
    letterSpacing: -0.3,
  },
  description: { lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BODY1 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING_TOKENS.XS,
  },
  detailValue: { flex: 1, textAlign: 'right', marginLeft: SPACING_TOKENS.MD },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  amenityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingRight: SPACING_TOKENS.SM,
  },
  linkButton: { marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  mapWrapper: { height: 220, overflow: 'hidden', borderRadius: BORDER_RADIUS_TOKENS.MD },
  landlordRow: { flexDirection: 'row', alignItems: 'center' },
  landlordInfo: { flex: 1, marginLeft: SPACING_TOKENS.MD },
  landlordNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.LG,
    padding: SPACING_TOKENS.SM,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  holdHint: { paddingHorizontal: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XS },
  holdStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.XS,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  actionRow: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  chatButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  actionFlex: { flex: 1, height: ACTION_BUTTON_SIZE },
  outlineAction: { borderColor: THEME_COLORS.PRIMARY },
  outlineActionText: { color: THEME_COLORS.PRIMARY_DARK },
});
