import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Building2 } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { APP_CONFIG } from '@core';
import { Typography } from '@ui';
import type { AuthStackParamList, RootStackParamList } from '@navigation';
import { useAuth } from '../hooks';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export const SplashScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, isInitialized, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'RoleSelection' } }],
        });
      }
    }, 800);

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
            {t('auth.splash.tagline')}
          </Typography>
        </View>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.slogan}>
          {t('auth.splash.slogan')}
        </Typography>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />

          <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.loadingText}>
            {t('auth.splash.checkingSession')}
          </Typography>
        </View>
      </View>

      <View style={styles.footer}>
        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED}>
          {t('auth.splash.version', { version: APP_CONFIG.VERSION })}
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
