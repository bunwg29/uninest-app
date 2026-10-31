import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { Heart, Share, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

interface ListingGalleryModalProps {
  isVisible: boolean;
  imageUrls: string[];
  initialIndex: number;
  isFavorite: boolean;
  onClose: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
}

const HEADER_ROW_HEIGHT = 44;
const HEADER_ACTION_SIZE = 44;
const THUMBNAIL_SIZE = 56;
const THUMBNAIL_GAP = SPACING_TOKENS.SM;
const INACTIVE_THUMBNAIL_OPACITY = 0.5;

export const ListingGalleryModal = ({
  isVisible,
  imageUrls,
  initialIndex,
  isFavorite,
  onClose,
  onShare,
  onToggleFavorite,
}: ListingGalleryModalProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<ScrollViewInstance>(null);
  const thumbnailsRef = useRef<ScrollViewInstance>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (isVisible) {
      setActiveIndex(initialIndex);
      pagerRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    }
  }, [isVisible, initialIndex, width]);

  useEffect(() => {
    thumbnailsRef.current?.scrollTo({
      x: Math.max(0, activeIndex * (THUMBNAIL_SIZE + THUMBNAIL_GAP) - width / 2),
      animated: true,
    });
  }, [activeIndex, width]);

  const handlePagerEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleSelectThumbnail = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return (
    <Modal visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING_TOKENS.MD }]}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng ảnh"
          >
            <X size={21} color={THEME_COLORS.WHITE} />
          </TouchableOpacity>

          <Typography variant="body1" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
            {`${activeIndex + 1} / ${imageUrls.length}`}
          </Typography>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={onShare}
              accessibilityRole="button"
              accessibilityLabel="Chia sẻ"
            >
              <Share size={20} color={THEME_COLORS.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={onToggleFavorite}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Bỏ lưu phòng' : 'Lưu phòng'}
            >
              <Heart
                size={20}
                color={isFavorite ? THEME_COLORS.ERROR : THEME_COLORS.WHITE}
                fill={isFavorite ? THEME_COLORS.ERROR : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePagerEnd}
          contentOffset={{ x: initialIndex * width, y: 0 }}
          style={styles.pager}
        >
          {imageUrls.map((uri, index) => (
            <View key={`${uri}-${index}`} style={[styles.page, { width }]}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        <ScrollView
          ref={thumbnailsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailsScroll}
          contentContainerStyle={[
            styles.thumbnails,
            { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.SM) + SPACING_TOKENS.XS },
          ]}
        >
          {imageUrls.map((uri, index) => (
            <TouchableOpacity
              key={`${uri}-${index}`}
              onPress={() => handleSelectThumbnail(index)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Xem ảnh ${index + 1}`}
              style={[
                styles.thumbnail,
                index === activeIndex ? styles.thumbnailActive : styles.thumbnailInactive,
              ]}
            >
              <Image source={{ uri }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OVERLAY_COLORS.GALLERY_BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: HEADER_ROW_HEIGHT,
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    paddingBottom: SPACING_TOKENS.SM,
  },
  headerAction: {
    width: HEADER_ACTION_SIZE,
    height: HEADER_ACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row' },
  pager: { flex: 1 },
  page: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  thumbnailsScroll: { flexGrow: 0 },
  thumbnails: {
    gap: THUMBNAIL_GAP,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  thumbnailInactive: { opacity: INACTIVE_THUMBNAIL_OPACITY },
  thumbnailActive: { borderWidth: 2, borderColor: THEME_COLORS.WHITE },
  thumbnailImage: { width: '100%', height: '100%' },
});
