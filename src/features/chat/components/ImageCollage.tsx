import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface ImageCollageProps {
  imageUrls: string[];
  onPressImage: (index: number) => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface CollageRow {
  count: number;
  height: number;
}

const MAX_VISIBLE_TILES = 5;
const TILE_GAP = 2;
const MAX_COLLAGE_WIDTH = 260;
const COLLAGE_WIDTH_RATIO = 0.62;
const MIN_ASPECT_RATIO = 0.75;
const MAX_ASPECT_RATIO = 1.5;
const MORE_OVERLAY_COLOR = 'rgba(23, 27, 34, 0.55)';

const getCollageRows = (total: number, width: number): CollageRow[] => {
  if (total === 2) {
    return [{ count: 2, height: width / 2 }];
  }

  if (total === 3) {
    return [
      { count: 1, height: width * 0.62 },
      { count: 2, height: width * 0.42 },
    ];
  }

  if (total === 4) {
    return [
      { count: 2, height: width / 2 },
      { count: 2, height: width / 2 },
    ];
  }

  return [
    { count: 2, height: width / 2 },
    { count: 3, height: width / 3 },
  ];
};

interface SingleImageProps {
  uri: string;
  width: number;
  onPress: () => void;
  onLongPress?: () => void;
}

const SingleImage = ({ uri, width, onPress, onLongPress }: SingleImageProps) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    let isActive = true;

    Image.getSize(
      uri,
      (imageWidth, imageHeight) => {
        if (isActive && imageWidth > 0 && imageHeight > 0) {
          setAspectRatio(
            Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, imageWidth / imageHeight))
          );
        }
      },
      () => undefined
    );

    return () => {
      isActive = false;
    };
  }, [uri]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onLongPress}>
      <Image source={{ uri }} style={{ width, height: width / aspectRatio }} />
    </TouchableOpacity>
  );
};

export const ImageCollage = ({
  imageUrls,
  onPressImage,
  onLongPress,
  style,
}: ImageCollageProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const collageWidth = Math.min(Math.round(screenWidth * COLLAGE_WIDTH_RATIO), MAX_COLLAGE_WIDTH);
  const total = imageUrls.length;
  const hiddenCount = total - MAX_VISIBLE_TILES;

  if (total === 1) {
    return (
      <View style={[styles.container, { width: collageWidth }, style]}>
        <SingleImage
          uri={imageUrls[0]}
          width={collageWidth}
          onPress={() => onPressImage(0)}
          onLongPress={onLongPress}
        />
      </View>
    );
  }

  const visibleUrls = imageUrls.slice(0, MAX_VISIBLE_TILES);
  let cursor = 0;

  return (
    <View style={[styles.container, { width: collageWidth }, style]}>
      {getCollageRows(total, collageWidth).map((row, rowIndex) => {
        const rowUrls = visibleUrls.slice(cursor, cursor + row.count);
        const rowStart = cursor;

        cursor += row.count;

        return (
          <View key={`row-${rowIndex}`} style={[styles.row, { height: row.height }]}>
            {rowUrls.map((uri, tileIndex) => {
              const imageIndex = rowStart + tileIndex;
              const isMoreTile = hiddenCount > 0 && imageIndex === MAX_VISIBLE_TILES - 1;

              return (
                <TouchableOpacity
                  key={`${uri}-${imageIndex}`}
                  style={styles.tile}
                  activeOpacity={0.9}
                  onPress={() => onPressImage(imageIndex)}
                  onLongPress={onLongPress}
                >
                  <Image source={{ uri }} style={styles.tileImage} />

                  {isMoreTile ? (
                    <View style={styles.moreOverlay}>
                      <Typography variant="h2" weight="BOLD" colorKey="WHITE">
                        {`+${hiddenCount}`}
                      </Typography>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    gap: TILE_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: TILE_GAP,
  },
  tile: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MORE_OVERLAY_COLOR,
  },
});
