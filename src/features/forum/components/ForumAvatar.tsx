import { Image, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';
import { getAvatarTone, getInitials } from '../utils';

export interface ForumAvatarProps {
  name: string;
  seed: string;
  uri?: string | null;
  size?: number;
}

export const ForumAvatar = ({ name, seed, uri, size = 40 }: ForumAvatarProps) => {
  const tone = getAvatarTone(seed);
  const dimensionStyle = { width: size, height: size };

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, dimensionStyle]} />;
  }

  return (
    <View style={[styles.base, dimensionStyle, { backgroundColor: tone.background }]}>
      <Typography variant={size < 36 ? 'tiny' : 'body2'} weight="BOLD" color={tone.text}>
        {getInitials(name)}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
