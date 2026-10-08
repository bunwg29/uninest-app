import { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Film, Plus, X, Star } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, Typography, ScreenContainer } from '@ui';
import {
  filterValidUploadImages,
  resolveImageContentType,
  resolveVideoContentType,
  validateUploadVideo,
} from '@core';
import { useResponsiveLayout, useToast } from '@hooks';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import type { LocalImageItem } from '../types';
import { MAX_LISTING_IMAGES } from '../types/constants';
import { WizardHeader } from '../components/landlord/WizardHeader';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const GRID_GAP = 12;
const SCREEN_PADDING = 16;
const PHOTO_TIPS = [
  'Toàn cảnh phòng từ cửa vào',
  'Gác lửng hoặc khu vực ngủ',
  'Cửa sổ và ánh sáng ban ngày',
  'Nhà vệ sinh',
  'Lối vào và chỗ để xe',
] as const;

export const ImagesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { contentWidth } = useResponsiveLayout();
  const columnCount = contentWidth >= 700 ? 5 : contentWidth >= 500 ? 4 : 3;
  const imageCellSize = Math.floor(
    (contentWidth - SCREEN_PADDING * 2 - GRID_GAP * (columnCount - 1)) / columnCount
  );
  const { localImages, setLocalImages, video, setVideo, editingListingId } = useListingPostStore();

  const handlePickImages = useCallback(async () => {
    if (localImages.length >= MAX_LISTING_IMAGES) {
      toast.warning(`Chỉ được chọn tối đa ${MAX_LISTING_IMAGES} ảnh`);

      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong Cài đặt',
        [{ text: 'Đóng' }]
      );

      return;
    }

    const remaining = MAX_LISTING_IMAGES - localImages.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });

    if (result.canceled || !result.assets.length) return;

    const { valid, firstError } = filterValidUploadImages(result.assets);

    if (firstError) toast.warning(firstError);

    if (valid.length === 0) return;

    const newImages: LocalImageItem[] = valid.map((asset, idx) => ({
      uri: asset.uri,
      isCover: localImages.length === 0 && idx === 0,
      sortOrder: localImages.length + idx,
      fileName: asset.fileName ?? `photo_${Date.now()}_${idx}.jpg`,
      contentType: resolveImageContentType(asset),
      fileSize: asset.fileSize ?? undefined,
    }));

    const combined = [...localImages, ...newImages].slice(0, MAX_LISTING_IMAGES);

    setLocalImages(combined);
  }, [localImages, setLocalImages, toast]);

  const handlePickVideo = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong Cài đặt',
        [{ text: 'Đóng' }]
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets.length) return;

    const asset = result.assets[0];
    const error = validateUploadVideo(asset);

    if (error) {
      toast.warning(error);

      return;
    }

    setVideo({
      uri: asset.uri,
      fileName: asset.fileName ?? `video_${Date.now()}.mp4`,
      contentType: resolveVideoContentType(asset),
      fileSize: asset.fileSize ?? undefined,
    });
  }, [setVideo, toast]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      const updated = localImages
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, sortOrder: i, isCover: i === 0 ? true : img.isCover }));

      const hasCover = updated.some((img) => img.isCover);

      if (!hasCover && updated.length > 0) {
        updated[0] = { ...updated[0], isCover: true };
      }

      setLocalImages(updated);
    },
    [localImages, setLocalImages]
  );

  const handleSetCover = useCallback(
    (index: number) => {
      const updated = localImages.map((img, i) => ({ ...img, isCover: i === index }));

      setLocalImages(updated);
    },
    [localImages, setLocalImages]
  );

  const handleContinue = useCallback(() => {
    if (localImages.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 ảnh phòng trọ');

      return;
    }

    navigation.navigate('ListingPostLocation');
  }, [localImages, navigation, toast]);

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <WizardHeader step={2} isEditing={Boolean(editingListingId)} onBack={navigation.goBack} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Typography variant="h2" weight="BOLD" style={styles.title}>
            Thêm ảnh thật của phòng
          </Typography>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
            Tối đa {MAX_LISTING_IMAGES} ảnh. Ảnh bìa hiện ở kết quả tìm kiếm.
          </Typography>
        </View>

        <View style={styles.grid}>
          {localImages.map((item, index) => (
            <View
              key={item.uri}
              style={[styles.imageCell, { width: imageCellSize, height: imageCellSize }]}
            >
              <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveImage(index)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Xoá ảnh"
              >
                <X size={12} color={THEME_COLORS.WHITE} />
              </TouchableOpacity>

              {item.isCover ? (
                <View style={styles.coverBadge}>
                  <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.TEXT_PRIMARY}>
                    ẢNH BÌA
                  </Typography>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.coverBtn}
                  onPress={() => handleSetCover(index)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Đặt làm ảnh bìa"
                >
                  <Star size={14} color={THEME_COLORS.WHITE} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {localImages.length < MAX_LISTING_IMAGES ? (
            <TouchableOpacity
              style={[styles.addCell, { width: imageCellSize, height: imageCellSize }]}
              onPress={handlePickImages}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Thêm ảnh"
            >
              <Plus size={24} color={THEME_COLORS.TEXT_MUTED} />
              <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                Thêm ảnh
              </Typography>
              <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
                {localImages.length} / {MAX_LISTING_IMAGES}
              </Typography>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.videoSection}>
          <Typography variant="body2" weight="BOLD">
            Video giới thiệu (không bắt buộc)
          </Typography>

          {video ? (
            <View style={styles.videoCard}>
              <View style={styles.videoIcon}>
                <Film size={20} color={THEME_COLORS.PRIMARY} />
              </View>

              <View style={styles.videoInfo}>
                <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
                  {video.fileName}
                </Typography>
                {video.fileSize ? (
                  <Typography variant="caption" colorKey="TEXT_MUTED">
                    {(video.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </Typography>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => setVideo(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Xoá video"
              >
                <X size={18} color={THEME_COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.videoAdd}
              onPress={handlePickVideo}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Thêm video"
            >
              <Film size={20} color={THEME_COLORS.TEXT_MUTED} />
              <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                Thêm video (mp4, mov, tối đa 100MB)
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBanner}>
          <Camera size={18} color={THEME_COLORS.PRIMARY_DARK} />
          <Typography
            variant="body2"
            weight="MEDIUM"
            colorKey="PRIMARY_DARK"
            style={styles.bannerText}
          >
            Nhấn biểu tượng ngôi sao để chọn ảnh bìa. Ảnh đầu tiên tự động thành ảnh bìa.
          </Typography>
        </View>

        <View style={styles.tipsCard}>
          <Typography variant="body2" weight="BOLD" style={styles.tipsTitle}>
            Nên chụp đủ 5 góc này
          </Typography>
          <View style={styles.tipsDivider} />
          {PHOTO_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Typography variant="body2" colorKey="TEXT_SECONDARY">
                {tip}
              </Typography>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button variant="primary" size="lg" fullWidth onPress={handleContinue}>
          Tiếp tục
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: SCREEN_PADDING, paddingBottom: SPACING_TOKENS.XL, gap: 16 },
  intro: { gap: 6 },
  title: { letterSpacing: -0.3 },
  subtitle: { lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  imageCell: {
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.RENTED_PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.COUNTER_BADGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  addCell: {
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  videoSection: { gap: 10 },
  videoAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  videoIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  videoInfo: { flex: 1, gap: 2 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  bannerText: { flex: 1, lineHeight: 20 },
  tipsCard: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  tipsTitle: { lineHeight: 22 },
  tipsDivider: { height: 1, marginVertical: 14, backgroundColor: THEME_COLORS.DIVIDER },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.STEP_PENDING_BORDER,
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
