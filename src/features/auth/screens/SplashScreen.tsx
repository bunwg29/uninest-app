import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Building2 } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { tokenStorage, APP_CONFIG } from '@core';
import { Typography } from '@ui';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, isInitialized, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const timer = setTimeout(async () => {
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });

        return;
      }

      const hasOnboarded = await tokenStorage.getOnboardingCompleted();

      if (!hasOnboarded) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'Onboarding' } }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'RoleSelection' } }],
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Building2 size={44} color={THEME_COLORS.SURFACE} />
        </View>

        <Typography
          variant="h1"
          weight="BOLD"
          color={THEME_COLORS.TEXT_PRIMARY}
          style={styles.appName}
        >
          {APP_CONFIG.NAME}
        </Typography>

        <View style={styles.tagWrapper}>
          <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
            Nền tảng thuê trọ sinh viên số 1 Student Housing
          </Typography>
        </View>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.slogan}>
          Tìm phòng trọ, căn hộ, bạn cùng phòng dễ dàng và an toàn Tìm trọ sinh viên — nhanh, gần
          trường, minh bạch giá
        </Typography>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />

          <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.loadingText}>
            Đang kiểm tra phiên đăng nhập...
          </Typography>
        </View>
      </View>

      <View style={styles.footer}>
        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED}>
          {`Phiên bản ${APP_CONFIG.VERSION}`}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.XL,
    paddingHorizontal: SPACING_TOKENS.LG,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: SPACING_TOKENS.XS,
  },
  tagWrapper: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    marginBottom: SPACING_TOKENS.MD,
  },
  slogan: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.XL,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.LG,
  },
  loadingText: {
    marginLeft: SPACING_TOKENS.SM,
  },
  footer: {
    alignItems: 'center',
  },
});
