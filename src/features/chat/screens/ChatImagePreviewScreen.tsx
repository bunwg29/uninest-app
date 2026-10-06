import { useCallback, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Image as ImageIcon, Plus, Send, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  THEME_COLORS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
import { Typography } from '@ui';
import { useToast } from '@hooks';
import { useAuth } from '@features/auth';
import type { RootStackParamList } from '@navigation/types';
import { useChatImagePicker, useSendMessage } from '../hooks';
import { CHAT_LIMITS } from '../types';

type ChatImagePreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'ChatImagePreview'>;

const THUMBNAIL_SIZE = 52;

export const ChatImagePreviewScreen = ({ navigation, route }: ChatImagePreviewScreenProps) => {
  const { conversationId, counterpartName, imageUris: initialImageUris } = route.params;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const { pickFromLibrary } = useChatImagePicker();
  const sendMessage = useSendMessage(conversationId, user?.id ?? '');

  const [imageUris, setImageUris] = useState<string[]>(initialImageUris);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [caption, setCaption] = useState('');

  const canAddMore = imageUris.length < CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE;
  const selectedUri = imageUris[Math.min(selectedIndex, imageUris.length - 1)];

  const handleAddImages = useCallback(async () => {
    if (!canAddMore) {
      toast.warning(`Mỗi tin nhắn tối đa ${CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE} ảnh`);

      return;
    }

    const picked = await pickFromLibrary(CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE - imageUris.length);

    if (picked.length > 0) {
      setImageUris((current) =>
        [...current, ...picked].slice(0, CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE)
      );
    }
  }, [canAddMore, imageUris.length, pickFromLibrary, toast]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      const remaining = imageUris.filter((_, position) => position !== index);

      if (remaining.length === 0) {
        navigation.goBack();

        return;
      }

      setImageUris(remaining);
      setSelectedIndex(0);
    },
    [imageUris, navigation]
  );

  const handleSend = useCallback(() => {
    sendMessage(caption, imageUris);
    navigation.goBack();
  }, [sendMessage, caption, imageUris, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Đóng"
        >
          <X size={21} color={THEME_COLORS.WHITE} />
        </TouchableOpacity>

        <Typography variant="body1" weight="SEMIBOLD" colorKey="WHITE" numberOfLines={1}>
          {counterpartName ? `Gửi tới ${counterpartName}` : 'Gửi ảnh'}
        </Typography>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => void handleAddImages()}
          accessibilityLabel="Thêm ảnh từ thư viện"
        >
          <ImageIcon size={21} color={THEME_COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        {selectedUri ? (
          <Image source={{ uri: selectedUri }} style={styles.previewImage} resizeMode="contain" />
        ) : null}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnails}
          style={styles.thumbnailScroll}
          keyboardShouldPersistTaps="handled"
        >
          {imageUris.map((uri, index) => (
            <TouchableOpacity
              key={`${uri}-${index}`}
              onPress={() => setSelectedIndex(index)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri }}
                style={[styles.thumbnail, index === selectedIndex && styles.thumbnailSelected]}
              />

              {imageUris.length > 1 ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                  hitSlop={6}
                  accessibilityLabel="Bỏ ảnh này"
                >
                  <X size={10} color={THEME_COLORS.WHITE} />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          ))}

          {canAddMore ? (
            <TouchableOpacity
              style={styles.addTile}
              onPress={() => void handleAddImages()}
              accessibilityLabel="Thêm ảnh"
            >
              <Plus size={20} color={THEME_COLORS.WHITE} />
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        <View style={styles.captionRow}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Thêm chú thích…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            maxLength={CHAT_LIMITS.MAX_CONTENT_LENGTH}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            accessibilityLabel="Gửi ảnh"
          >
            <Send size={20} color={THEME_COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <AlertCircle size={18} color={OVERLAY_COLORS.AMBER_GRADIENT_START} />

          <Typography
            variant="body2"
            color={OVERLAY_COLORS.AMBER_GRADIENT_START}
            style={styles.warningText}
          >
            Cân nhắc trước khi gửi giấy tờ tuỳ thân. Chủ trọ chỉ cần xem trực tiếp khi ký hợp đồng.
          </Typography>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OVERLAY_COLORS.GALLERY_BACKGROUND,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.SM + 6,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingTop: 0,
    gap: SPACING_TOKENS.SM + 6,
  },
  thumbnailScroll: {
    flexGrow: 0,
  },
  thumbnails: {
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.XS,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    opacity: 0.55,
  },
  thumbnailSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: THEME_COLORS.WHITE,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_MUTED,
  },
  addTile: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OVERLAY_COLORS.DARK_DASHED_BORDER,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 2,
  },
  captionInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.DARK_FIELD,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SM,
    color: THEME_COLORS.WHITE,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
    marginHorizontal: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.SM + 2,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.AMBER_NOTICE_BORDER,
    backgroundColor: OVERLAY_COLORS.AMBER_NOTICE_BACKGROUND,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
  },
});
