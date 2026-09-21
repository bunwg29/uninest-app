import { View, StyleSheet } from 'react-native';
import { Sparkles, Bot } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';

export const AiChatScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Bot size={44} color={THEME_COLORS.PRIMARY} />
      </View>

      <View style={styles.badge}>
        <Sparkles size={14} color={THEME_COLORS.PRIMARY} />
        <Typography
          variant="caption"
          weight="SEMIBOLD"
          color={THEME_COLORS.PRIMARY}
          style={styles.badgeText}
        >
          Trợ lý tìm trọ thông minh
        </Typography>
      </View>

      <Typography variant="h2" weight="BOLD" color={THEME_COLORS.TEXT_PRIMARY} style={styles.title}>
        Trợ lý AI UniNest
      </Typography>

      <Typography
        variant="body2"
        color={THEME_COLORS.TEXT_MUTED}
        align="center"
        style={styles.description}
      >
        Bạn cần tìm phòng như thế nào? Cứ nhập yêu cầu bằng ngôn ngữ tự nhiên, ví dụ: "Tìm phòng
        dưới 2 triệu 5 gần Bách Khoa, có chỗ để xe".
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    marginBottom: SPACING_TOKENS.SM,
  },
  badgeText: {
    marginLeft: 4,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  description: {
    maxWidth: 320,
    lineHeight: 20,
  },
});
