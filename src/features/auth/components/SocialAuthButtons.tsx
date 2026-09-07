import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface SocialAuthButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  disabled?: boolean;
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#171B22"
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.62 1.34-.57.65-1.06 1.71-.93 2.72 1 .08 2.01-.46 2.62-1.21z"
    />
  </Svg>
);

export const SocialAuthButtons = ({
  onGooglePress,
  onApplePress,
  disabled = false,
}: SocialAuthButtonsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onGooglePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <GoogleIcon />

        <Typography variant="body2" weight="MEDIUM" style={styles.buttonText}>
          {t('auth.login.continueGoogle')}
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onApplePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <AppleIcon />

        <Typography variant="body2" weight="MEDIUM" style={styles.buttonText}>
          {t('auth.login.continueApple')}
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: SPACING_TOKENS.SM,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  buttonText: {
    marginLeft: SPACING_TOKENS.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
});
