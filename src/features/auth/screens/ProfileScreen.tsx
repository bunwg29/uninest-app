import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const handleNavigateToAuth = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('navigation.profile')}</Text>

      <TouchableOpacity style={styles.button} onPress={handleNavigateToAuth}>
        <Text style={styles.buttonText}>{t('navigation.login')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.BACKGROUND,
    padding: SPACING_TOKENS.MD,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.TEXT_PRIMARY,
    marginBottom: SPACING_TOKENS.LG,
  },
  button: {
    backgroundColor: THEME_COLORS.PRIMARY,
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: 8,
  },
  buttonText: {
    color: THEME_COLORS.SURFACE,
    fontWeight: '600',
    fontSize: 16,
  },
});
