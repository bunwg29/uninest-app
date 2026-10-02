import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { SearchListingItem, SearchListingLocation } from '../types';

interface SearchResultsMapProps {
  listings: SearchListingItem[];
  selectedListingId: string | null;
  userLocation?: SearchListingLocation;
  onSelectListing: (listingId: string) => void;
  onRegionChange: (location: SearchListingLocation) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 16.073,
  longitude: 108.149,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const formatShortPrice = (price: number) => {
  const priceInMillions = price / 1000000;

  return `${Number.isInteger(priceInMillions) ? priceInMillions : priceInMillions.toFixed(1)}tr`;
};

const SearchResultsMapComponent = ({
  listings,
  selectedListingId,
  userLocation,
  onSelectListing,
  onRegionChange,
}: SearchResultsMapProps) => {
  const initialRegion = useMemo<Region>(
    () =>
      userLocation
        ? { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 }
        : DEFAULT_REGION,
    [userLocation]
  );
  const markers = listings.filter((listing) => listing.location !== undefined);

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton={false}
      showsCompass
      loadingEnabled
      loadingIndicatorColor={THEME_COLORS.PRIMARY}
      onRegionChangeComplete={(region) =>
        onRegionChange({ latitude: region.latitude, longitude: region.longitude })
      }
    >
      {markers.map((listing) => {
        const isSelected = listing.id === selectedListingId;

        return (
          <Marker
            key={listing.id}
            coordinate={listing.location!}
            onPress={() => onSelectListing(listing.id)}
            tracksViewChanges={isSelected}
          >
            <View style={[styles.marker, isSelected && styles.selectedMarker]}>
              <Typography
                variant="caption"
                weight="BOLD"
                color={isSelected ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PRIMARY}
              >
                {formatShortPrice(listing.price)}
              </Typography>
            </View>
            <View style={[styles.markerTip, isSelected && styles.selectedMarkerTip]} />
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
    minWidth: 54,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: THEME_COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMarker: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
  markerTip: {
    width: 8,
    height: 8,
    alignSelf: 'center',
    marginTop: -5,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectedMarkerTip: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
});
