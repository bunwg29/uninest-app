import { StyleSheet } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { ScreenContainer, Typography } from '@ui';

export const LandlordPlaceholderScreen = () => (
  <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
    <Typography variant="h2" weight="BOLD">
      Tính năng đang được hoàn thiện
    </Typography>
    <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      Màn hình này sẽ được kết nối với luồng nghiệp vụ tương ứng.
    </Typography>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  description: { marginTop: SPACING_TOKENS.SM },
});
