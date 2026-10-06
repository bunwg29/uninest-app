import { Image, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

export interface ForumImageStripProps {
  imageUrls: string[];
  maxVisible?: number;
  height?: number;
}

export const ForumImageStrip = ({
  imageUrls,
  maxVisible = 3,
  height = 80,
}: ForumImageStripProps) => {
  if (!imageUrls.length) return null;

  const visibleUrls = imageUrls.slice(0, maxVisible);
  const hiddenCount = imageUrls.length - visibleUrls.length;

  return (
    <View style={styles.row}>
      {visibleUrls.map((url, index) => {
        const isLastVisible = index === visibleUrls.length - 1 && hiddenCount > 0;

        return (
          <View key={`${url}-${index}`} style={[styles.imageWrapper, { height }]}>
            <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />

            {isLastVisible ? (
              <View style={styles.overlay}>
                <Typography variant="body1" weight="BOLD" colorKey="WHITE">
                  +{hiddenCount}
                </Typography>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
  },
  imageWrapper: {
    flex: 1,
    maxWidth: 106,
    borderRadius: BORDER_RADIUS_TOKENS.SM + 2,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY_COLORS.IMAGE_MORE_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
