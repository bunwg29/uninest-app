import { useEffect, useState } from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { GradientView } from './GradientView';

export interface MediaThumbnailProps {
  uri?: string | null;
  placeholderColors: readonly [string, string];
  style?: StyleProp<ImageStyle>;
}

export const MediaThumbnail = ({ uri, placeholderColors, style }: MediaThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (uri && !hasError) {
    return (
      <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setHasError(true)} />
    );
  }

  return <GradientView colors={placeholderColors} style={StyleSheet.flatten(style) as ViewStyle} />;
};
