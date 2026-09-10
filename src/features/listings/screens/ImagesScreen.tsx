import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Star, Upload } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography, HeaderBar, ScreenContainer } from '@ui';
import { useToast } from '@hooks';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { useUploadImages } from '../hooks/useUploadImages';
import type { LocalImageItem } from '../types';
import { MAX_LISTING_IMAGES, LISTING_FORM_STEPS } from '../types/constants';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const TOTAL_STEPS = LISTING_FORM_STEPS.length;
const IMAGE_CELL_SIZE = 100;

export const ImagesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { localImages, setLocalImages, setUploadedImages } = useListingPostStore();
  const { uploadAll, isUploading, uploadProgress, errors: uploadErrors } = useUploadImages();
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

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

    const newImages: LocalImageItem[] = result.assets.map((asset, idx) => ({
      uri: asset.uri,
      isCover: localImages.length === 0 && idx === 0,
      sortOrder: localImages.length + idx,
      fileName: asset.fileName ?? `photo_${Date.now()}_${idx}.jpg`,
      contentType: asset.mimeType ?? 'image/jpeg',
    }));

    const combined = [...localImages, ...newImages].slice(0, MAX_LISTING_IMAGES);

    setLocalImages(combined);
  }, [localImages, setLocalImages, toast]);

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

  const handleContinue = useCallback(async () => {
    if (localImages.length === 0) {
      navigation.navigate('ListingPostLocation');

      return;
    }

    setHasAttemptedUpload(true);
    const uploaded = await uploadAll(localImages);

    if (uploaded.length === 0 && localImages.length > 0) {
      toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');

      return;
    }

    setUploadedImages(uploaded);

    if (uploadErrors.length > 0) {
      toast.warning(
        `${uploadErrors.length} ảnh không tải được. Tiếp tục với ${uploaded.length} ảnh.`
      );
    }

    navigation.navigate('ListingPostLocation');
  }, [localImages, uploadAll, setUploadedImages, uploadErrors, navigation, toast]);

  return (
    <ScreenContainer applyTopInset applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title="Đăng tin mới"
        onBack={() => navigation.goBack()}
        subtitle={`Bước 2 / ${TOTAL_STEPS}: Ảnh phòng`}
        alignTitle="left"
      />

      <StepIndicator currentStep={2} totalSteps={TOTAL_STEPS} />

      <View style={styles.flex}>
        <FlatList
          data={localImages}
          keyExtractor={(item) => item.uri}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Typography variant="body2" colorKey="TEXT_SECONDARY">
                Chọn ảnh phòng (tối đa {MAX_LISTING_IMAGES} ảnh). Ảnh đầu tiên sẽ là ảnh bìa.
              </Typography>
            </View>
          }
          ListFooterComponent={
            localImages.length < MAX_LISTING_IMAGES ? (
              <TouchableOpacity
                style={styles.addCell}
                onPress={handlePickImages}
                activeOpacity={0.7}
              >
                <Plus size={28} color={THEME_COLORS.PRIMARY} />
                <Typography variant="caption" colorKey="PRIMARY" style={styles.addLabel}>
                  Thêm ảnh
                </Typography>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item, index }) => (
            <View style={styles.imageCell}>
              <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveImage(index)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <X size={14} color={THEME_COLORS.WHITE} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.coverBtn, item.isCover && styles.coverBtnActive]}
                onPress={() => handleSetCover(index)}
              >
                <Star
                  size={14}
                  color={item.isCover ? THEME_COLORS.SECONDARY : THEME_COLORS.WHITE}
                  fill={item.isCover ? THEME_COLORS.SECONDARY : 'transparent'}
                />
              </TouchableOpacity>

              {item.isCover ? (
                <View style={styles.coverBadge}>
                  <Typography
                    variant="caption"
                    color={THEME_COLORS.WHITE}
                    style={styles.coverBadgeText}
                  >
                    Bìa
                  </Typography>
                </View>
              ) : null}
            </View>
          )}
        />
      </View>

      {isUploading ? (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="PRIMARY" style={styles.uploadingText}>
            Đang tải ảnh... {uploadProgress}%
          </Typography>
        </View>
      ) : null}

      {hasAttemptedUpload && uploadErrors.length > 0 && !isUploading ? (
        <View style={styles.errorBanner}>
          <Typography variant="caption" colorKey="ERROR">
            {uploadErrors.length} ảnh tải lên thất bại. Vui lòng thử lại hoặc bỏ qua.
          </Typography>
        </View>
      ) : null}

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isUploading}
          onPress={handleContinue}
          leftIcon={isUploading ? undefined : <Upload size={18} color={THEME_COLORS.WHITE} />}
        >
          {isUploading ? 'Đang tải ảnh...' : 'Tiếp tục'}
        </Button>
      </View>
    </ScreenContainer>
  );
};

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = currentStep / totalSteps;

  return (
    <View style={indicatorStyles.container}>
      <View style={indicatorStyles.track}>
        <View style={[indicatorStyles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  track: {
    height: 4,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerSection: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
  },
  grid: {
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingBottom: SPACING_TOKENS.XL,
  },
  imageCell: {
    width: IMAGE_CELL_SIZE,
    height: IMAGE_CELL_SIZE,
    margin: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.XS,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  coverBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  addCell: {
    width: IMAGE_CELL_SIZE,
    height: IMAGE_CELL_SIZE,
    margin: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: THEME_COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  addLabel: {
    marginTop: 4,
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    gap: SPACING_TOKENS.SM,
  },
  uploadingText: {
    flex: 1,
  },
  errorBanner: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
