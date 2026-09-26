import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { tokenStorage, APP_CONFIG } from '@core';
import { ScreenContainer, Typography } from '@ui';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { useAuth } from '../hooks';

const APP_LOGO = require('../../../../assets/logo.png');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
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
      if (onFinish) {
        onFinish();

        return;
      }

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
          routes: [{ name: 'Auth', params: { screen: 'Login' } }],
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated, navigation, onFinish]);

  return (
    <ScreenContainer style={styles.container} keyboardAvoiding={false}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={APP_LOGO} style={styles.logoImage} resizeMode="cover" />
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
            Nền tảng thuê trọ sinh viên số 1
          </Typography>
        </View>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.slogan}>
          Tìm phòng trọ, căn hộ và bạn cùng phòng dễ dàng, an toàn và minh bạch giá
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
    </ScreenContainer>
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
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: THEME_COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
