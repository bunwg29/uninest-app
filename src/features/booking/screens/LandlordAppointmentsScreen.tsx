import { CalendarDays } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { ScreenContainer, Typography } from '@ui';

export const LandlordAppointmentsScreen = () => (
  <ScreenContainer style={styles.safeArea} applyBottomInset={false} keyboardAvoiding={false}>
    <View style={styles.header}>
      <Typography variant="h1" weight="BOLD">
        Lịch hẹn
      </Typography>
    </View>

    <View style={styles.content}>
      <CalendarDays size={44} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      <Typography variant="h3" weight="BOLD" align="center" style={styles.title}>
        Tính năng đang phát triển
      </Typography>
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    height: 58,
    paddingHorizontal: SPACING_TOKENS.MD,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  title: { marginTop: SPACING_TOKENS.MD },
});
