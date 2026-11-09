import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Search, Sparkles, Square } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { GradientView, Typography } from '@ui';

export const AiUserBubble = ({ content }: { content: string }) => (
  <View style={styles.userRow}>
    <View style={styles.userBubble}>
      <Typography variant="body2" color={THEME_COLORS.WHITE} style={styles.userText}>
        {content}
      </Typography>
    </View>
  </View>
);

interface AiAssistantFrameProps {
  children: ReactNode;
  isError?: boolean;
}

export const AiAssistantFrame = ({ children, isError = false }: AiAssistantFrameProps) => (
  <View style={styles.assistantRow}>
    {isError ? (
      <View style={[styles.avatar, styles.avatarMuted]}>
        <Sparkles size={17} color={THEME_COLORS.WHITE} />
      </View>
    ) : (
      <GradientView
        colors={[THEME_COLORS.PRIMARY, OVERLAY_COLORS.AI_BANNER_END]}
        style={styles.avatar}
      >
        <Sparkles size={17} color={THEME_COLORS.WHITE} />
      </GradientView>
    )}

    <View style={[styles.assistantCard, isError && styles.assistantCardError]}>{children}</View>
  </View>
);

const TypingDots = () => (
  <View style={styles.dots}>
    <View style={[styles.dot, styles.dotActive]} />
    <View style={styles.dot} />
    <View style={[styles.dot, styles.dotFaint]} />
  </View>
);

export const AiPendingMessage = ({ onStop }: { onStop: () => void }) => (
  <View>
    <AiAssistantFrame>
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        MÌNH ĐANG TÌM GIÚP BẠN
      </Typography>

      <View style={styles.pendingRow}>
        <Search size={14} color={THEME_COLORS.TEXT_PLACEHOLDER} />

        <Typography variant="label" colorKey="TEXT_SECONDARY" style={styles.pendingText}>
          Đang tìm trong các tin đăng đang hiển thị…
        </Typography>
      </View>

      <TypingDots />
    </AiAssistantFrame>

    <TouchableOpacity
      style={styles.stopButton}
      onPress={onStop}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <Square size={10} color={THEME_COLORS.ERROR} fill={THEME_COLORS.ERROR} />

      <Typography variant="label" weight="MEDIUM" colorKey="TEXT_PRIMARY">
        Dừng trả lời
      </Typography>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'flex-end',
    paddingLeft: SPACING_TOKENS.XXL + SPACING_TOKENS.MD,
  },
  userBubble: {
    paddingHorizontal: 14,
    paddingVertical: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.PRIMARY,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.XS,
  },
  userText: {
    lineHeight: 21,
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarMuted: {
    backgroundColor: OVERLAY_COLORS.TEXT_DISABLED,
  },
  assistantCard: {
    flex: 1,
    padding: 14,
    gap: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XS,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.LG,
  },
  assistantCardError: {
    borderColor: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
    paddingTop: SPACING_TOKENS.SM + 4,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  pendingText: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.XS,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME_COLORS.BORDER,
  },
  dotActive: {
    backgroundColor: THEME_COLORS.TEXT_PLACEHOLDER,
  },
  dotFaint: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  stopButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    height: 32,
    marginTop: SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
