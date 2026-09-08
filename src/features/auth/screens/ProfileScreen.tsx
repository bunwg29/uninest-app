import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogOut } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Avatar, Badge, Button, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();

    toast.info('Đã đăng xuất thành công');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  const handleGoToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <ScreenContainer style={styles.container}>
      <Typography variant="h2" weight="BOLD" style={styles.headerTitle}>
        {t('navigation.profile')}
      </Typography>

      {isAuthenticated && user ? (
        <View style={styles.card}>
          <View style={styles.userHeader}>
            <Avatar name={user.fullName} size="lg" />

            <View style={styles.userInfo}>
              <Typography variant="h3" weight="SEMIBOLD" color={THEME_COLORS.TEXT_PRIMARY}>
                {user.fullName}
              </Typography>

              <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED} style={styles.phoneText}>
                {user.phoneNumber}
              </Typography>

              <View style={styles.badgeRow}>
                <Badge
                  variant={user.role === 'landlord' ? 'holding' : 'available'}
                  size="sm"
                  label={
                    user.role === 'landlord'
                      ? t('auth.role.landlordTitle')
                      : t('auth.role.studentTitle')
                  }
                />
              </View>
            </View>
          </View>

          <Button
            variant="danger"
            size="md"
            fullWidth
            leftIcon={<LogOut size={18} color={THEME_COLORS.SURFACE} />}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            {t('navigation.login') === 'Đăng nhập' ? 'Đăng xuất' : 'Logout'}
          </Button>
        </View>
      ) : (
        <View style={styles.card}>
          <Typography
            variant="body1"
            color={THEME_COLORS.TEXT_MUTED}
            style={styles.notLoggedInText}
          >
            {t('auth.login.subtitle')}
          </Typography>

          <Button variant="primary" size="lg" fullWidth onPress={handleGoToLogin}>
            {t('navigation.login')}
          </Button>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingTop: SPACING_TOKENS.LG,
  },
  headerTitle: {
    marginBottom: SPACING_TOKENS.LG,
  },
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.LG,
  },
  userInfo: {
    marginLeft: SPACING_TOKENS.MD,
    flex: 1,
  },
  phoneText: {
    marginVertical: 2,
  },
  badgeRow: {
    marginTop: 4,
  },
  logoutButton: {
    marginTop: SPACING_TOKENS.MD,
  },
  notLoggedInText: {
    marginBottom: SPACING_TOKENS.LG,
    textAlign: 'center',
  },
});
