import { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  MapPin,
  Maximize2,
  Users,
  Banknote,
  Zap,
  Droplets,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import {
  Button,
  Typography,
  HeaderBar,
  ScreenContainer,
  Badge,
  Divider,
  LoadingOverlay,
} from '@ui';
import { useToast } from '@hooks';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { useCreateListing, useUpdateListing } from '../hooks/useCreateListing';
import { useUploadImages } from '../hooks/useUploadImages';
import {
  ROOM_TYPE_OPTIONS,
  DAYS_OF_WEEK,
  VIEWING_SLOT_LABELS,
  AMENITY_DISPLAY_LIST,
} from '../types/constants';
import type {
  CreateListingPayload,
  CreateListingImagePayload,
  DayKey,
  ViewingSlot,
} from '../types';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - SPACING_TOKENS.MD * 2;
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH * 0.6);

const formatVND = (value: string | number | undefined): string => {
  if (!value) return '0 ₫';

  const num = typeof value === 'string' ? Number(value) : value;

  if (isNaN(num)) return '0 ₫';

  return `${num.toLocaleString('vi-VN')} ₫`;
};

export const PreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const {
    step1,
    step3,
    uploadedImages,
    setUploadedImages,
    localImages,
    selectedAmenityIds,
    viewingSchedule,
    editingListingId,
    reset,
  } = useListingPostStore();

  const { mutate: createListing, isPending } = useCreateListing();
  const { mutate: updateListing, isPending: isUpdating } = useUpdateListing();
  const { uploadAll, isUploading: isUploadingImages, uploadProgress } = useUploadImages();

  const roomTypeLabel = useMemo(() => {
    return ROOM_TYPE_OPTIONS.find((opt) => opt.value === step1.roomType)?.label ?? step1.roomType;
  }, [step1.roomType]);

  const imagesToDisplay = useMemo(() => {
    return localImages.map((img) => ({
      url: img.uri,
      isCover: img.isCover,
    }));
  }, [localImages]);

  const selectedAmenityNames = useMemo(() => {
    return AMENITY_DISPLAY_LIST.filter((a) => selectedAmenityIds.includes(a.id)).map((a) => a.name);
  }, [selectedAmenityIds]);

  const fullAddress = useMemo(() => {
    const parts = [step3.streetAddress, step3.wardName, step3.provinceName].filter(Boolean);

    return parts.join(', ');
  }, [step3]);

  const scheduleSummary = useMemo(() => {
    const result: { dayLabel: string; slots: string[] }[] = [];

    DAYS_OF_WEEK.forEach(({ key, label }) => {
      const daySlots = viewingSchedule[key as DayKey];

      if (daySlots) {
        const activeSlots: string[] = [];

        VIEWING_SLOT_LABELS.forEach(({ key: slotKey, label: slotLabel }) => {
          if (daySlots[slotKey as keyof ViewingSlot]) {
            activeSlots.push(slotLabel);
          }
        });

        if (activeSlots.length > 0) {
          result.push({ dayLabel: label, slots: activeSlots });
        }
      }
    });

    return result;
  }, [viewingSchedule]);

  const handleSubmit = useCallback(async () => {
    if (localImages.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh cho phòng trọ');

      return;
    }

    let finalImages: CreateListingImagePayload[] = [];

    if (uploadedImages.length === localImages.length && uploadedImages.length > 0) {
      finalImages = uploadedImages.map((img) => ({
        url: img.publicUrl,
        isCover: img.isCover,
      }));
    } else {
      try {
        const uploaded = await uploadAll(localImages);

        if (uploaded.length !== localImages.length) {
          toast.error('Tải ảnh lên máy chủ thất bại. Vui lòng kiểm tra kết nối và thử lại.');

          return;
        }

        setUploadedImages(uploaded);
        finalImages = uploaded.map((img) => ({
          url: img.publicUrl,
          isCover: img.isCover,
        }));
      } catch {
        toast.error('Lỗi khi tải ảnh lên Cloudflare R2. Vui lòng thử lại.');

        return;
      }
    }

    const payload: CreateListingPayload = {
      title: step1.title.trim(),
      description: step1.description?.trim() || undefined,
      roomType: step1.roomType,
      price: Number(step1.price) || 0,
      area: Number(step1.area) || 0,
      maxOccupants: Number(step1.maxOccupants) || 1,
      electricPrice: step1.electricPrice ? Number(step1.electricPrice) : undefined,
      waterPrice: step1.waterPrice ? Number(step1.waterPrice) : undefined,
      deposit: step1.deposit ? Number(step1.deposit) : undefined,
      streetAddress: step3.streetAddress.trim(),
      provinceCode: step3.provinceCode,
      wardCode: step3.wardCode,
      latitude: step3.latitude ?? 0,
      longitude: step3.longitude ?? 0,
      images: finalImages,
      amenityIds: selectedAmenityIds,
    };

    const onSuccess = (response: { id: string }) => {
      navigation.navigate('ListingPostSuccess', { listingId: response.id });

      InteractionManager.runAfterInteractions(() => {
        reset();
      });
    };

    const onError = (error: { message?: string }) => {
      toast.error(error.message || 'Không thể lưu tin đăng. Vui lòng thử lại.');
    };

    if (editingListingId) {
      updateListing({ id: editingListingId, dto: payload }, { onSuccess, onError });

      return;
    }

    createListing(payload, { onSuccess, onError });
  }, [
    localImages,
    uploadedImages,
    uploadAll,
    setUploadedImages,
    step1,
    step3,
    selectedAmenityIds,
    editingListingId,
    createListing,
    navigation,
    reset,
    toast,
  ]);

  return (
    <ScreenContainer applyTopInset applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title="Xem trước tin đăng"
        onBack={() => navigation.goBack()}
        subtitle="Kiểm tra kỹ thông tin trước khi gửi duyệt"
        alignTitle="left"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Images Preview */}
        {imagesToDisplay.length > 0 ? (
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              style={{ height: IMAGE_HEIGHT }}
              contentContainerStyle={{ height: IMAGE_HEIGHT }}
            >
              {imagesToDisplay.map((item, index) => (
                <View key={`preview-img-${index}`} style={styles.imageSlide}>
                  <Image
                    source={{ uri: item.url }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  {item.isCover && (
                    <View style={styles.coverBadge}>
                      <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.SURFACE}>
                        Ảnh bìa
                      </Typography>
                    </View>
                  )}
                  <View style={styles.imageCounterBadge}>
                    <Typography variant="tiny" weight="MEDIUM" color={THEME_COLORS.SURFACE}>
                      {index + 1}/{imagesToDisplay.length}
                    </Typography>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Primary Info Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Badge label={roomTypeLabel} variant="primary" size="md" />
            <Badge label="Chờ gửi duyệt" variant="holding" size="md" />
          </View>

          <Typography variant="h2" weight="BOLD" colorKey="PRIMARY" style={styles.priceText}>
            {formatVND(step1.price)}
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {' '}
              / tháng
            </Typography>
          </Typography>

          <Typography
            variant="h3"
            weight="SEMIBOLD"
            colorKey="TEXT_PRIMARY"
            style={styles.titleText}
          >
            {step1.title || 'Chưa đặt tiêu đề'}
          </Typography>

          <View style={styles.locationRow}>
            <MapPin size={18} color={THEME_COLORS.PRIMARY} style={styles.iconOffset} />
            <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.locationText}>
              {fullAddress || 'Chưa chọn địa chỉ'}
            </Typography>
          </View>
        </View>

        {/* Highlights Grid */}
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Maximize2 size={20} color={THEME_COLORS.PRIMARY} />
            <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.specLabel}>
              Diện tích
            </Typography>
            <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              {step1.area ? `${step1.area} m²` : '---'}
            </Typography>
          </View>

          <View style={styles.specItem}>
            <Users size={20} color={THEME_COLORS.PRIMARY} />
            <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.specLabel}>
              Sức chứa
            </Typography>
            <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              {step1.maxOccupants ? `${step1.maxOccupants} người` : '---'}
            </Typography>
          </View>

          <View style={styles.specItem}>
            <Banknote size={20} color={THEME_COLORS.PRIMARY} />
            <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.specLabel}>
              Tiền đặt cọc
            </Typography>
            <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              {step1.deposit ? formatVND(step1.deposit) : 'Không có'}
            </Typography>
          </View>
        </View>

        {/* Service Costs Card */}
        <View style={styles.card}>
          <Typography
            variant="body1"
            weight="SEMIBOLD"
            colorKey="TEXT_PRIMARY"
            style={styles.sectionTitle}
          >
            Chi phí dịch vụ hàng tháng
          </Typography>

          <View style={styles.feeRow}>
            <View style={styles.feeLeft}>
              <Zap size={18} color={THEME_COLORS.WARNING} />
              <Typography variant="body2" colorKey="TEXT_PRIMARY">
                Tiền điện
              </Typography>
            </View>
            <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PRIMARY">
              {step1.electricPrice
                ? `${formatVND(step1.electricPrice)} / kWh`
                : 'Theo giá nhà nước'}
            </Typography>
          </View>

          <Divider style={styles.feeDivider} />

          <View style={styles.feeRow}>
            <View style={styles.feeLeft}>
              <Droplets size={18} color={THEME_COLORS.PRIMARY} />
              <Typography variant="body2" colorKey="TEXT_PRIMARY">
                Tiền nước
              </Typography>
            </View>
            <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_PRIMARY">
              {step1.waterPrice ? `${formatVND(step1.waterPrice)} / khối` : 'Theo giá nhà nước'}
            </Typography>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={THEME_COLORS.PRIMARY} />
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Mô tả chi tiết
            </Typography>
          </View>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.descriptionText}>
            {step1.description || 'Chủ trọ chưa nhập mô tả chi tiết cho phòng này.'}
          </Typography>
        </View>

        {/* Amenities Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={18} color={THEME_COLORS.PRIMARY} />
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Tiện ích phòng ({selectedAmenityIds.length})
            </Typography>
          </View>
          {selectedAmenityNames.length > 0 ? (
            <View style={styles.amenitiesWrap}>
              {selectedAmenityNames.map((name) => (
                <View key={name} style={styles.amenityTag}>
                  <Typography variant="caption" colorKey="PRIMARY" weight="MEDIUM">
                    ✓ {name}
                  </Typography>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Chưa chọn tiện ích nào.
            </Typography>
          )}
        </View>

        {/* Viewing Schedule Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={THEME_COLORS.PRIMARY} />
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Khung giờ xem phòng
            </Typography>
          </View>

          {scheduleSummary.length > 0 ? (
            <View style={styles.scheduleList}>
              {scheduleSummary.map(({ dayLabel, slots }) => (
                <View key={dayLabel} style={styles.scheduleRow}>
                  <View style={styles.dayPill}>
                    <Typography variant="caption" weight="BOLD" colorKey="PRIMARY">
                      {dayLabel}
                    </Typography>
                  </View>
                  <Typography variant="body2" colorKey="TEXT_SECONDARY">
                    {slots.join(', ')}
                  </Typography>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Chưa thiết lập lịch xem phòng định kỳ (sinh viên sẽ liên hệ trực tiếp).
            </Typography>
          )}
        </View>

        {/* Notice Card */}
        <View style={styles.noticeCard}>
          <AlertCircle size={20} color={THEME_COLORS.PRIMARY} style={styles.noticeIcon} />
          <Typography variant="caption" colorKey="TEXT_SECONDARY" style={styles.noticeText}>
            Tin đăng sẽ được đội ngũ UniNest duyệt trong vòng 2 - 24 giờ. Bạn có thể theo dõi trạng
            thái bài đăng trong mục Quản lý tin.
          </Typography>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Button
          title="Chỉnh sửa"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.editButton}
          disabled={isPending || isUpdating || isUploadingImages}
        />
        <Button
          title={
            isUploadingImages
              ? `Đang tải ảnh (${uploadProgress}%)...`
              : isPending || isUpdating
                ? 'Đang đăng...'
                : 'Đăng tin'
          }
          variant="primary"
          onPress={handleSubmit}
          isLoading={isPending || isUpdating || isUploadingImages}
          disabled={isPending || isUpdating || isUploadingImages}
          style={styles.submitButton}
        />
      </View>

      {(isPending || isUpdating || isUploadingImages) && (
        <LoadingOverlay
          isFullScreen
          message={
            isUploadingImages
              ? `Đang tải ảnh lên Cloudflare R2 (${uploadProgress}%)...`
              : 'Đang gửi tin đăng tới máy chủ...'
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
  scrollContent: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XXL,
    gap: SPACING_TOKENS.MD,
  },
  imageSection: {
    height: IMAGE_HEIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
    marginBottom: SPACING_TOKENS.XS,
  },
  imageSlide: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  coverBadge: {
    position: 'absolute',
    top: SPACING_TOKENS.SM,
    left: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: SPACING_TOKENS.SM,
    right: SPACING_TOKENS.SM,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
  },
  priceText: {
    marginBottom: SPACING_TOKENS.XS,
  },
  titleText: {
    marginBottom: SPACING_TOKENS.SM,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.XS,
  },
  iconOffset: {
    marginTop: 2,
  },
  locationText: {
    flex: 1,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
  },
  specItem: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    gap: 4,
  },
  specLabel: {
    marginTop: 2,
  },
  sectionTitle: {
    marginBottom: SPACING_TOKENS.MD,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.XS,
  },
  feeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
  },
  feeDivider: {
    marginVertical: SPACING_TOKENS.SM,
  },
  descriptionText: {
    lineHeight: 22,
  },
  scheduleList: {
    gap: SPACING_TOKENS.SM,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
  },
  dayPill: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
    alignItems: 'flex-start',
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    gap: SPACING_TOKENS.MD,
  },
  editButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  amenityTag: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});
