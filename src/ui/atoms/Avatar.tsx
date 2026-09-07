import { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { User } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from './Typography';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Avatar = ({ uri, name, size = 'md', isOnline = false, style }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const dimension = SIZE_DIMENSIONS[size];
  const initials = getInitials(name);
  const showImage = Boolean(uri) && !imageError;

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={[styles.image, { width: dimension, height: dimension }]}
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <View
          style={[
            styles.fallbackContainer,
            { width: dimension, height: dimension, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
          ]}
        >
          <Typography
            variant={size === 'sm' ? 'tiny' : size === 'xl' ? 'h2' : 'body2'}
            weight="BOLD"
            color={THEME_COLORS.PRIMARY}
          >
            {initials}
          </Typography>
        </View>
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            { width: dimension, height: dimension, backgroundColor: THEME_COLORS.SURFACE_MUTED },
          ]}
        >
          <User size={dimension * 0.5} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        </View>
      )}

      {isOnline ? (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: Math.max(8, dimension * 0.25),
              height: Math.max(8, dimension * 0.25),
            },
          ]}
        />
      ) : null}
    </View>
  );
};

function getInitials(name?: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const SIZE_DIMENSIONS: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  image: {
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  fallbackContainer: {
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME_COLORS.SUCCESS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 2,
    borderColor: THEME_COLORS.SURFACE,
  },
});
