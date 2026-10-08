import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';

interface ListingVideoPlayerProps {
  uri: string;
}

export const ListingVideoPlayer = ({ uri }: ListingVideoPlayerProps) => {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
};

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
});
