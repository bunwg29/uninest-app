import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Camera, Plus, Send } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, TYPOGRAPHY_TOKENS } from '@theme';
import { Typography } from '@ui';
import { CHAT_LIMITS } from '../types';

export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onPickImages: () => void;
  onTakePhoto: () => void;
  quickReplies?: readonly string[];
  onPressQuickReply?: (text: string) => void;
}

export const ChatComposer = ({
  value,
  onChangeText,
  onSend,
  onPickImages,
  onTakePhoto,
  quickReplies = [],
  onPressQuickReply,
}: ChatComposerProps) => {
  const canSend = value.trim().length > 0;
  const shouldShowQuickReplies = quickReplies.length > 0 && !canSend;

  return (
    <View style={styles.container}>
      {shouldShowQuickReplies ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickReplies}
          keyboardShouldPersistTaps="handled"
        >
          {quickReplies.map((reply) => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReplyChip}
              onPress={() => onPressQuickReply?.(reply)}
              activeOpacity={0.8}
            >
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_SECONDARY">
                {reply}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPickImages}
          accessibilityLabel="Chọn ảnh từ thư viện"
        >
          <Plus size={22} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Nhắn tin…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            multiline
            maxLength={CHAT_LIMITS.MAX_CONTENT_LENGTH}
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onTakePhoto}
          accessibilityLabel="Chụp ảnh"
        >
          <Camera size={22} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={onSend}
          disabled={!canSend}
          accessibilityLabel="Gửi tin nhắn"
        >
          <Send size={20} color={canSend ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PLACEHOLDER} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    paddingBottom: SPACING_TOKENS.SM,
  },
  quickReplies: {
    paddingHorizontal: SPACING_TOKENS.MD - 4,
    paddingVertical: SPACING_TOKENS.SM,
    gap: SPACING_TOKENS.SM,
  },
  quickReplyChip: {
    height: 32,
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingTop: SPACING_TOKENS.XS,
    gap: SPACING_TOKENS.SM,
  },
  iconButton: {
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: 21,
  },
  input: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
    paddingVertical: SPACING_TOKENS.SM,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  sendButtonActive: {
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
