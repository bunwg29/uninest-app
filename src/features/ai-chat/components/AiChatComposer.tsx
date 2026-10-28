import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { AI_CHAT_MESSAGE_MAX_LENGTH } from '../types';

interface AiChatComposerProps {
  value: string;
  placeholder: string;
  isDisabled?: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const AiChatComposer = ({
  value,
  placeholder,
  isDisabled = false,
  onChangeText,
  onSend,
}: AiChatComposerProps) => {
  const canSend = !isDisabled && value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
          editable={!isDisabled}
          multiline
          maxLength={AI_CHAT_MESSAGE_MAX_LENGTH}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Gửi cho trợ lý"
      >
        <Send size={20} color={canSend ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PLACEHOLDER} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    borderRadius: 22,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  input: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BODY2,
    color: THEME_COLORS.TEXT_PRIMARY,
    paddingVertical: SPACING_TOKENS.SM + 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
