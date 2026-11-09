import type { ComponentType } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ChevronRight,
  CreditCard,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { GradientView, Typography } from '@ui';

interface PromptSuggestion {
  text: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
}

export const AI_PROMPT_SUGGESTIONS: readonly PromptSuggestion[] = [
  { text: 'Tìm phòng dưới 2 triệu 5 gần Bách khoa, có chỗ để xe', Icon: Search },
  { text: 'Phòng ở ghép cho nữ, khoảng 1,2 triệu một người', Icon: Users },
  { text: 'Phòng trọ ở Hoà Khánh dưới 2 triệu có máy lạnh', Icon: CreditCard },
  { text: 'Nên hỏi chủ trọ những gì trước khi đặt cọc?', Icon: GraduationCap },
];

interface AiWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export const AiWelcome = ({ onSelectPrompt }: AiWelcomeProps) => (
  <View style={styles.container}>
    <View style={styles.hero}>
      <GradientView
        colors={[THEME_COLORS.PRIMARY, OVERLAY_COLORS.AI_BANNER_END]}
        style={styles.heroIcon}
      >
        <Sparkles size={28} color={THEME_COLORS.WHITE} />
      </GradientView>

      <Typography variant="h2" weight="BOLD" colorKey="TEXT_PRIMARY" align="center">
        Tả nhu cầu bằng lời của bạn
      </Typography>

      <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
        Mình đọc hiểu rồi tìm trong các phòng đang cho thuê thật trên UniNest — không gợi ý phòng
        không tồn tại.
      </Typography>
    </View>

    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER" style={styles.label}>
      THỬ HỎI
    </Typography>

    <View style={styles.prompts}>
      {AI_PROMPT_SUGGESTIONS.map(({ text, Icon }) => (
        <TouchableOpacity
          key={text}
          style={styles.prompt}
          onPress={() => onSelectPrompt(text)}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <View style={styles.promptIcon}>
            <Icon size={18} color={THEME_COLORS.PRIMARY_DARK} />
          </View>

          <Typography variant="body2" colorKey="TEXT_PRIMARY" style={styles.promptText}>
            {text}
          </Typography>

          <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: SPACING_TOKENS.MD,
  },
  hero: {
    alignItems: 'center',
    paddingTop: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.SM,
    overflow: 'hidden',
  },
  description: {
    maxWidth: 320,
    lineHeight: 21,
  },
  label: {
    marginTop: SPACING_TOKENS.LG,
    marginBottom: SPACING_TOKENS.SM + 4,
    letterSpacing: 0.6,
  },
  prompts: {
    gap: SPACING_TOKENS.SM + 4,
  },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    minHeight: 64,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  promptIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    flex: 1,
    lineHeight: 21,
  },
});
