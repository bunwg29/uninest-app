import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientView } from './GradientView';
import { Typography } from './Typography';

const ONLINE_DOT_SIZE = 13;

const AVATAR_TONES = [
  {
    colors: [OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT],
    text: THEME_COLORS.PRIMARY_DARK,
  },
  {
    colors: [OVERLAY_COLORS.AMBER_GRADIENT_START, THEME_COLORS.WARNING_LIGHT],
    text: THEME_COLORS.WARNING,
  },
  {
    colors: [OVERLAY_COLORS.SUCCESS_BORDER, THEME_COLORS.SUCCESS_LIGHT],
    text: THEME_COLORS.SUCCESS,
  },
] as const;

export interface GradientAvatarProps {
  name?: string;
  seed?: string;
  uri?: string | null;
  size?: number;
  isOnline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return '?';

  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getTone = (seed: string) => {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);

  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const getInitialsFontSize = (size: number) => {
  if (size >= 56) return 19;

  if (size >= 44) return 16;

  if (size >= 40) return 15;

  return 14;
};

export const GradientAvatar = ({
  name = '',
  seed,
  uri,
  size = 40,
  isOnline = false,
  style,
}: GradientAvatarProps) => {
  const tone = getTone(seed ?? name);
  const dimensionStyle = { width: size, height: size };

  return (
    <View style={[dimensionStyle, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.round, dimensionStyle]} />
      ) : (
        <GradientView colors={tone.colors} style={[styles.round, dimensionStyle, styles.center]}>
          <Typography
            variant="body2"
            weight="BOLD"
            color={tone.text}
            style={{ fontSize: getInitialsFontSize(size), lineHeight: undefined }}
          >
            {getInitials(name)}
          </Typography>
        </GradientView>
      )}

      {isOnline ? <View style={styles.onlineDot} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  round: {
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: ONLINE_DOT_SIZE,
    height: ONLINE_DOT_SIZE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 2,
    borderColor: THEME_COLORS.SURFACE,
    backgroundColor: OVERLAY_COLORS.ONLINE_DOT,
  },
});
