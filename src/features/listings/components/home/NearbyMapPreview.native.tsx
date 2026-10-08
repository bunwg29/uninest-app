import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

const MAP_HEIGHT = 180;
const NEARBY_DELTA = 0.012;
const FALLBACK_DELTA = 0.05;
const MAX_PREVIEW_MARKERS = 12;
const FALLBACK_COORDINATE = { latitude: 16.0678, longitude: 108.2208 };

interface PreviewCoordinate {
  latitude: number;
  longitude: number;
}

interface NearbyMapPreviewProps {
  listings?: Array<{ id: string; location?: PreviewCoordinate }>;
  onPress?: () => void;
}

type LocationStatus = 'loading' | 'ready' | 'denied';

export const NearbyMapPreview = ({ listings = [], onPress }: NearbyMapPreviewProps) => {
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [coordinate, setCoordinate] = useState<PreviewCoordinate>();

  useEffect(() => {
    let isCancelled = false;

    const locate = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (isCancelled) return;

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          setStatus('denied');

          return;
        }

        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

        if (isCancelled || !position) return;

        setCoordinate({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus('ready');
      } catch {
        if (!isCancelled) setStatus('denied');
      }
    };

    void locate();

    return () => {
      isCancelled = true;
    };
  }, []);

  const region = useMemo<Region>(() => {
    const center = coordinate ?? FALLBACK_COORDINATE;
    const delta = coordinate ? NEARBY_DELTA : FALLBACK_DELTA;

    return { ...center, latitudeDelta: delta, longitudeDelta: delta };
  }, [coordinate]);

  const markers = useMemo(
    () =>
      listings.filter((listing) => listing.location !== undefined).slice(0, MAX_PREVIEW_MARKERS),
    [listings]
  );

  return (
    <View style={styles.container}>
      <MapView
        key={coordinate ? 'located' : 'default'}
        style={styles.map}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsCompass={false}
        toolbarEnabled={false}
        pointerEvents="none"
      >
        {markers.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={listing.location as PreviewCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.listingDot} />
          </Marker>
        ))}

        {coordinate ? (
          <Marker
            coordinate={coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            zIndex={10}
          >
            <View style={styles.halo}>
              <View style={styles.dot} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Mở bản đồ tìm phòng"
      />

      <View style={styles.badge} pointerEvents="none">
        <LocateFixed size={14} color={THEME_COLORS.PRIMARY} />
        <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
          {status === 'ready'
            ? 'Vị trí của bạn'
            : status === 'loading'
              ? 'Đang xác định vị trí…'
              : 'Chưa có vị trí của bạn'}
        </Typography>
      </View>

      {status === 'denied' ? (
        <TouchableOpacity
          style={styles.enableButton}
          onPress={() => void Linking.openSettings()}
          accessibilityRole="button"
        >
          <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
            Bật vị trí
          </Typography>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    marginHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
    backgroundColor: OVERLAY_COLORS.MAP_LAND,
  },
  map: { ...StyleSheet.absoluteFill },
  listingDot: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  halo: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.PRIMARY_HALO,
  },
  dot: {
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  badge: {
    position: 'absolute',
    left: SPACING_TOKENS.SM + 2,
    bottom: SPACING_TOKENS.SM + 2,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  enableButton: {
    position: 'absolute',
    right: SPACING_TOKENS.SM + 2,
    bottom: SPACING_TOKENS.SM + 2,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
