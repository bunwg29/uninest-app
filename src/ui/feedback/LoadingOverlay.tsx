import { View, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';

export interface LoadingOverlayProps {
  message?: string;
  isFullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LoadingOverlay = ({ message, isFullScreen = false, style }: LoadingOverlayProps) => {
  const { t } = useTranslation();
  const resolvedMessage = message || t('common.loading');

  if (isFullScreen) {
    return (
      <View style={[styles.fullScreenBackdrop, style]}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />

          <Typography
            variant="body2"
            weight="MEDIUM"
            colorKey="TEXT_PRIMARY"
            style={styles.message}
          >
            {resolvedMessage}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />

      <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.inlineMessage}>
        {resolvedMessage}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 27, 34, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    shadowColor: '#171B22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  message: {
    marginTop: SPACING_TOKENS.MD,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.MD,
  },
  inlineMessage: {
    marginLeft: SPACING_TOKENS.SM,
  },
});
