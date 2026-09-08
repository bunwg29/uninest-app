import { View, Text, StyleSheet } from 'react-native';
import { THEME_COLORS } from '@theme';

export const CommunityScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cộng đồng</Text>
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
  },
});
