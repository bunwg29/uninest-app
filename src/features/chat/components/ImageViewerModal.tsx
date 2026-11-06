import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface ImageViewerModalProps {
  isVisible: boolean;
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageViewerModal = ({
  isVisible,
  imageUrls,
  initialIndex,
  onClose,
}: ImageViewerModalProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (isVisible) {
      scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    }
  }, [isVisible, initialIndex, width]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: initialIndex * width, y: 0 }}
        >
          {imageUrls.map((uri, index) => (
            <View key={`${uri}-${index}`} style={{ width, height }}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        <View style={[styles.header, { top: insets.top + SPACING_TOKENS.SM }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Đóng ảnh"
          >
            <X size={22} color={THEME_COLORS.WHITE} />
          </TouchableOpacity>

          {imageUrls.length > 1 ? (
            <Typography variant="body2" weight="SEMIBOLD" colorKey="WHITE">
              {`${imageUrls.length} ảnh`}
            </Typography>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BLACK,
  },
  image: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: SPACING_TOKENS.MD,
    right: SPACING_TOKENS.MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
