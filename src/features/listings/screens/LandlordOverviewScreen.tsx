import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Construction } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

export const LandlordOverviewScreen = () => (
  <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Construction size={34} color={THEME_COLORS.PRIMARY} />
      </View>
      <Typography variant="h2" weight="BOLD" align="center">
        Tổng quan đang được phát triển
      </Typography>
      <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
        Số liệu vận hành và các công việc cần xử lý sẽ được bổ sung trong phiên bản tiếp theo.
      </Typography>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.XL,
  },
  iconContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  description: { marginTop: SPACING_TOKENS.SM, lineHeight: 22 },
});
