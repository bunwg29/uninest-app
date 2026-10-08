import { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, Check, Clock3, Eye } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, Typography, ScreenContainer, LoadingOverlay, BackButton } from '@ui';
import { useResponsiveLayout, useToast } from '@hooks';
import type { ListingPostStackParamList, RootStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { useCreateListing, useUpdateListing } from '../hooks/useCreateListing';
import { useUploadImages } from '../hooks/useUploadImages';
import { listingService } from '../services/listingService';
import { ROOM_TYPE_OPTIONS, AMENITY_DISPLAY_LIST } from '../types/constants';
import { LandlordStatusPill } from '../components/landlord/LandlordStatusPill';
import type { CreateListingPayload, CreateListingImagePayload, UploadedImageItem } from '../types';
import { formatFullPrice } from '@core';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const MAX_PREVIEW_AMENITIES = 3;
const RECOMMENDED_IMAGE_COUNT = 6;
const PHONE_PATTERN = /(?:\+?84|0)[\s.-]?\d(?:[\s.-]?\d){8}/;

export const PreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { contentWidth, isCompact } = useResponsiveLayout();
  const imageWidth = Math.max(contentWidth - SPACING_TOKENS.MD * 2 - 2, 1);
  const imageHeight = Math.min(Math.round(imageWidth * 0.43), 280);
  const {
    step1,
    step3,
    setUploadedImages,
    localImages,
    setLocalImages,
    video,
    setVideo,
    universities,
    selectedAmenityIds,
    viewingSchedule,
    editingListingId,
    hasEditChanges,
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

  const checklist = useMemo(() => {
    const hasRequiredInfo = Boolean(
      step1.title.trim() && step1.roomType && step1.price && step1.area && step1.maxOccupants
    );
    const hasPinnedLocation = step3.latitude !== null && step3.longitude !== null;
    const hasPhoneInDescription = PHONE_PATTERN.test(step1.description ?? '');
    const imageCount = localImages.length;

    return [
      { key: 'info', ok: hasRequiredInfo, label: 'Đủ thông tin bắt buộc' },
      { key: 'pin', ok: hasPinnedLocation, label: 'Vị trí đã ghim trên bản đồ' },
      {
        key: 'phone',
        ok: !hasPhoneInDescription,
        label: hasPhoneInDescription
          ? 'Mô tả đang chứa số điện thoại'
          : 'Không phát hiện số điện thoại trong mô tả',
      },
      imageCount < RECOMMENDED_IMAGE_COUNT
        ? {
            key: 'images',
            ok: false,
            label: `Mới có ${imageCount} ảnh — tin từ ${RECOMMENDED_IMAGE_COUNT} ảnh nhận nhiều liên hệ hơn`,
          }
        : { key: 'images', ok: true, label: `Đã có ${imageCount} ảnh` },
    ];
  }, [step1, step3, localImages.length]);

  const handleSubmit = useCallback(async () => {
    if (localImages.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh cho phòng trọ');

      return;
    }

    if (editingListingId && !hasEditChanges()) {
      const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

      toast.info('Tin đăng không có thay đổi');
      reset();

      if (rootNavigation) {
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Listings' } }],
        });
      } else {
        navigation.goBack();
      }

      return;
    }

    const videoTask: Promise<{ key: string | null } | { error: true }> =
      video && !video.uploadedKey
        ? listingService.uploadVideo(video).then(
            (key) => ({ key }),
            () => ({ error: true as const })
          )
        : Promise.resolve({ key: video?.uploadedKey ?? null });
    const imagesNeedingUpload = localImages.filter((image) => !image.uploadedUrl);
    let uploadedImages: UploadedImageItem[] = [];

    if (imagesNeedingUpload.length > 0) {
      try {
        uploadedImages = await uploadAll(imagesNeedingUpload);

        if (uploadedImages.length !== imagesNeedingUpload.length) {
          toast.error('Tải ảnh lên máy chủ thất bại. Vui lòng kiểm tra kết nối và thử lại.');

          return;
        }
      } catch {
        toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');

        return;
      }
    }

    const videoResult = await videoTask;

    if ('error' in videoResult) {
      toast.error('Tải video lên thất bại. Vui lòng thử lại.');

      return;
    }

    if (video && videoResult.key && !video.uploadedKey) {
      setVideo({ ...video, uploadedKey: videoResult.key });
    }

    const uploadedBySortOrder = new Map(
      uploadedImages.map((image) => [image.sortOrder, image] as const)
    );
    const syncedLocalImages = localImages.map((image) => ({
      ...image,
      uploadedUrl: image.uploadedUrl ?? uploadedBySortOrder.get(image.sortOrder)?.publicUrl,
      uploadedKey: image.uploadedKey ?? uploadedBySortOrder.get(image.sortOrder)?.key,
    }));

    if (syncedLocalImages.some((image) => !image.uploadedUrl || !image.uploadedKey)) {
      toast.error('Không thể xác định đầy đủ ảnh đã tải lên. Vui lòng thử lại.');

      return;
    }

    const syncedUploadedImages = syncedLocalImages.map((image) => ({
      publicUrl: image.uploadedUrl as string,
      key: image.uploadedKey as string,
      isCover: image.isCover,
      sortOrder: image.sortOrder,
    }));
    const finalImages: CreateListingImagePayload[] = syncedUploadedImages.map((image) => ({
      key: image.key,
      isCover: image.isCover,
    }));

    setLocalImages(syncedLocalImages);
    setUploadedImages(syncedUploadedImages);

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
      videoKey: videoResult.key,
      universityCodes: universities.map((university) => university.code),
      amenityIds: selectedAmenityIds,
      viewingSchedule,
    };

    const onSuccess = (response: { id: string }) => {
      navigation.navigate('ListingPostSuccess', {
        listingId: response.id,
        title: payload.title,
        price: payload.price,
        area: payload.area,
        imageUri:
          syncedLocalImages.find((image) => image.isCover)?.uri ?? syncedLocalImages[0]?.uri,
      });

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          reset();
        });
      } else {
        setTimeout(() => {
          reset();
        }, 0);
      }
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
    video,
    setVideo,
    universities,
    uploadAll,
    setUploadedImages,
    setLocalImages,
    step1,
    step3,
    selectedAmenityIds,
    viewingSchedule,
    editingListingId,
    hasEditChanges,
    createListing,
    navigation,
    reset,
    toast,
  ]);

  const isBusy = isPending || isUpdating || isUploadingImages;
  const extraAmenities = selectedAmenityNames.length - MAX_PREVIEW_AMENITIES;

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <View style={styles.header}>
        <BackButton onPress={navigation.goBack} accessibilityLabel="Quay lại" />
        <Typography variant="h3" weight="SEMIBOLD">
          Xem trước
        </Typography>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewCard}>
          <View style={styles.previewBanner}>
            <Eye size={14} color={THEME_COLORS.WHITE} />
            <Typography
              variant="caption"
              weight="BOLD"
              color={THEME_COLORS.WHITE}
              style={styles.bannerLabel}
            >
              SINH VIÊN SẼ THẤY NHƯ THẾ NÀY
            </Typography>
          </View>

          <View style={[styles.imageSection, { height: imageHeight }]}>
            {imagesToDisplay.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                style={{ height: imageHeight }}
                contentContainerStyle={{ height: imageHeight }}
              >
                {imagesToDisplay.map((item, index) => (
                  <View
                    key={`preview-img-${index}`}
                    style={[styles.imageSlide, { width: imageWidth, height: imageHeight }]}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageCounterBadge}>
                      <Typography variant="caption" weight="BOLD" color={THEME_COLORS.WHITE}>
                        {index + 1} / {imagesToDisplay.length}
                      </Typography>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.availability}>
              <LandlordStatusPill label="Còn trống" tone="success" />
            </View>
          </View>

          <View style={styles.previewBody}>
            <Typography variant="h3" weight="BOLD" style={styles.titleText}>
              {step1.title || 'Chưa đặt tiêu đề'}
            </Typography>

            <Typography variant="h2" weight="BOLD" colorKey="PRIMARY">
              {formatFullPrice(Number(step1.price) || 0)}
              <Typography variant="body1" colorKey="TEXT_SECONDARY">
                {' '}
                /tháng
              </Typography>
            </Typography>

            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {[
                step1.area ? `${step1.area} m²` : null,
                step1.maxOccupants ? `${step1.maxOccupants} người` : null,
                roomTypeLabel || null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>

            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {fullAddress || 'Chưa chọn địa chỉ'}
            </Typography>

            {universities.length > 0 ? (
              <Typography variant="body2" colorKey="PRIMARY">
                {`Gần ${universities.map((university) => university.name).join(' · ')}`}
              </Typography>
            ) : null}

            {selectedAmenityNames.length > 0 ? (
              <View style={styles.amenitiesWrap}>
                {selectedAmenityNames.slice(0, MAX_PREVIEW_AMENITIES).map((name) => (
                  <View key={name} style={styles.amenityTag}>
                    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_SECONDARY">
                      {name}
                    </Typography>
                  </View>
                ))}
                {extraAmenities > 0 ? (
                  <View style={styles.amenityTag}>
                    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_SECONDARY">
                      +{extraAmenities}
                    </Typography>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.checkCard}>
          <Typography variant="body2" weight="BOLD" style={styles.checkTitle}>
            Kiểm tra trước khi gửi
          </Typography>
          <View style={styles.checkDivider} />

          {checklist.map((item) => (
            <View key={item.key} style={styles.checkRow}>
              <View style={styles.checkIcon}>
                {item.ok ? (
                  <Check size={14} color={THEME_COLORS.SUCCESS} strokeWidth={3} />
                ) : (
                  <AlertCircle size={14} color={OVERLAY_COLORS.EXPIRED_TEXT} />
                )}
              </View>
              <Typography
                variant="body2"
                color={item.ok ? THEME_COLORS.TEXT_SECONDARY : OVERLAY_COLORS.EXPIRED_TEXT}
                style={styles.checkLabel}
              >
                {item.label}
              </Typography>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Clock3 size={18} color={THEME_COLORS.PRIMARY_DARK} style={styles.noticeIcon} />
          <Typography variant="body2" colorKey="PRIMARY_DARK" style={styles.noticeText}>
            Tin sẽ ở trạng thái{' '}
            <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
              Chờ duyệt
            </Typography>{' '}
            cho tới khi quản trị viên kiểm tra, thường trong 4–8 giờ làm việc.
          </Typography>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, isCompact && styles.bottomBarCompact]}>
        <Button
          title="Chỉnh sửa"
          variant="outline"
          size="lg"
          onPress={() => navigation.goBack()}
          style={styles.editButton}
          disabled={isBusy}
        />
        <Button
          title={
            isUploadingImages
              ? `Đang tải ảnh (${uploadProgress}%)...`
              : isPending || isUpdating
                ? editingListingId
                  ? 'Đang sửa...'
                  : 'Đang đăng...'
                : editingListingId
                  ? 'Sửa tin'
                  : 'Đăng tin'
          }
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isLoading={isBusy}
          disabled={isBusy}
          style={styles.submitButton}
        />
      </View>

      {isBusy && (
        <LoadingOverlay
          isFullScreen
          message={
            isUploadingImages
              ? `Đang tải ảnh lên (${uploadProgress}%)...`
              : editingListingId
                ? 'Đang cập nhật tin đăng...'
                : 'Đang gửi tin đăng tới máy chủ...'
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  scrollContent: { padding: 16, paddingBottom: SPACING_TOKENS.XXL, gap: 16 },
  previewCard: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  previewBanner: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
  bannerLabel: { letterSpacing: 0.5 },
  imageSection: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  imageSlide: { position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  availability: { position: 'absolute', top: 12, left: 12 },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.COUNTER_BADGE,
  },
  previewBody: { gap: 8, padding: 16 },
  titleText: { lineHeight: 26 },
  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  amenityTag: {
    height: 28,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  checkCard: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  checkTitle: { lineHeight: 22 },
  checkDivider: { height: 1, marginVertical: 14, backgroundColor: THEME_COLORS.DIVIDER },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  checkIcon: { width: 16, height: 20, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { flex: 1, lineHeight: 20 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  noticeIcon: { marginTop: 1 },
  noticeText: { flex: 1, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    gap: SPACING_TOKENS.MD,
  },
  bottomBarCompact: { flexDirection: 'column' },
  editButton: { flex: 1 },
  submitButton: { flex: 2 },
});
