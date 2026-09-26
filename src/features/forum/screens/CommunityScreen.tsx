import { Text, StyleSheet } from 'react-native';
import { THEME_COLORS } from '@theme';
import { ScreenContainer } from '@ui';

export const CommunityScreen = () => {
  return (
    <ScreenContainer style={styles.container} keyboardAvoiding={false}>
      <Text style={styles.title}>Cộng đồng</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.TEXT_PRIMARY,
  },
});
