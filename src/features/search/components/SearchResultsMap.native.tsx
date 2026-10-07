import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { GraduationCap } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { SearchListingItem, SearchListingLocation, SearchSchool } from '../types';
import { clusterListings, formatShortPrice } from '../utils';

interface SearchResultsMapProps {
  listings: SearchListingItem[];
  selectedListingId: string | null;
  userLocation?: SearchListingLocation;
  school?: SearchSchool;
  myLocation?: SearchListingLocation;
  recenterToken?: number;
  onSelectListing: (listingId: string) => void;
  onOpenListing?: (listingId: string) => void;
  onPressMap?: () => void;
  onRegionChange: (location: SearchListingLocation) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 16.073,
  longitude: 108.149,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const MY_LOCATION_DELTA = 0.02;

const SearchResultsMapComponent = ({
  listings,
  selectedListingId,
  userLocation,
  school,
  myLocation,
  recenterToken = 0,
  onSelectListing,
  onOpenListing,
  onPressMap,
  onRegionChange,
}: SearchResultsMapProps) => {
  const mapRef = useRef<MapView>(null);
  const initialRegion = useMemo<Region>(
    () =>
      userLocation
        ? { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 }
        : DEFAULT_REGION,
    // Vùng ban đầu chỉ tính một lần, các lần đổi vị trí sau được xử lý bằng animateToRegion.
    []
  );
  const [region, setRegion] = useState<Region>(initialRegion);
  const items = useMemo(
    () => clusterListings(listings, region, selectedListingId),
    [listings, region, selectedListingId]
  );

  useEffect(() => {
    const focus = school ?? userLocation;

    if (!focus) return;

    mapRef.current?.animateToRegion(
      {
        latitude: focus.latitude,
        longitude: focus.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      300
    );
  }, [school, userLocation]);

  useEffect(() => {
    if (!myLocation || recenterToken === 0) return;

    mapRef.current?.animateToRegion(
      {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: MY_LOCATION_DELTA,
        longitudeDelta: MY_LOCATION_DELTA,
      },
      400
    );
  }, [recenterToken]);

  const handleClusterPress = (location: SearchListingLocation) => {
    mapRef.current?.animateToRegion(
      {
        ...location,
        latitudeDelta: region.latitudeDelta / 3,
        longitudeDelta: region.longitudeDelta / 3,
      },
      300
    );
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton={false}
      showsCompass={false}
      loadingEnabled
      loadingIndicatorColor={THEME_COLORS.PRIMARY}
      onPress={onPressMap}
      onRegionChangeComplete={(nextRegion) => {
        setRegion(nextRegion);
        onRegionChange({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
      }}
    >
      {myLocation ? (
        <Marker
          coordinate={myLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          zIndex={10}
          accessibilityLabel="Vị trí hiện tại của bạn"
        >
          <View style={styles.myLocationHalo}>
            <View style={styles.myLocationDot} />
          </View>
        </Marker>
      ) : null}

      {school ? (
        <Marker
          coordinate={{ latitude: school.latitude, longitude: school.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.schoolMarker}>
            <GraduationCap size={12} color={THEME_COLORS.WHITE} />
            <Typography variant="tiny" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
              {school.shortName}
            </Typography>
          </View>
        </Marker>
      ) : null}

      {items.map((item) => {
        if (item.type === 'cluster') {
          return (
            <Marker
              key={item.key}
              coordinate={item.location}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => handleClusterPress(item.location)}
              tracksViewChanges={false}
            >
              <View style={[styles.cluster, item.count >= 10 && styles.largeCluster]}>
                <Typography variant="body2" weight="BOLD" color={THEME_COLORS.WHITE}>
                  {item.count}
                </Typography>
              </View>
            </Marker>
          );
        }

        const isSelected = item.listing.id === selectedListingId;

        return (
          <Marker
            key={item.key}
            coordinate={item.location}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() =>
              isSelected && onOpenListing
                ? onOpenListing(item.listing.id)
                : onSelectListing(item.listing.id)
            }
            tracksViewChanges={isSelected}
          >
            <View style={[styles.marker, isSelected && styles.selectedMarker]}>
              <Typography
                variant="label"
                weight="BOLD"
                color={isSelected ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PRIMARY}
              >
                {formatShortPrice(item.listing.price)}
              </Typography>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
};

export const SearchResultsMap = memo(SearchResultsMapComponent);

const styles = StyleSheet.create({
  map: { flex: 1 },
  marker: {
    minWidth: 50,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMarker: { backgroundColor: THEME_COLORS.PRIMARY },
  cluster: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  largeCluster: { width: 46, height: 46 },
  myLocationHalo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: 'rgba(29, 83, 204, 0.18)',
  },
  myLocationDot: {
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: THEME_COLORS.WHITE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  schoolMarker: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
});
