import { View, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, TYPOGRAPHY_TOKENS } from '@theme';
import { Typography } from '@ui';

export const OfflineBanner = () => (
  <View style={styles.container}>
    <WifiOff size={16} color={THEME_COLORS.WHITE} />

    <Typography variant="body2" weight="SEMIBOLD" colorKey="WHITE" style={styles.text}>
      Không có kết nối — tin nhắn sẽ tự gửi khi có mạng
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
  text: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
  },
});
