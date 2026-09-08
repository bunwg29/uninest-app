import { View, Text, StyleSheet } from 'react-native';
import { THEME_COLORS } from '@theme';

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      <Text style={styles.subtitle}>UniNest</Text>
    </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME_COLORS.PRIMARY,
    fontWeight: '600',
  },
});
