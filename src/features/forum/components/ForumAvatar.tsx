import type { StyleProp, ViewStyle } from 'react-native';
import { GradientAvatar } from '@ui';

export interface ForumAvatarProps {
  name: string;
  seed: string;
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const ForumAvatar = ({ name, seed, uri, size = 40, style }: ForumAvatarProps) => (
  <GradientAvatar name={name} seed={seed} uri={uri} size={size} style={style} />
);
