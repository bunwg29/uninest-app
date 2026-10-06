import { GradientAvatar } from '@ui';

export interface ForumAvatarProps {
  name: string;
  seed: string;
  uri?: string | null;
  size?: number;
}

export const ForumAvatar = ({ name, seed, uri, size = 40 }: ForumAvatarProps) => (
  <GradientAvatar name={name} seed={seed} uri={uri} size={size} />
);
