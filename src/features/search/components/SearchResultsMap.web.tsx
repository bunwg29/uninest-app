import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

const formatShortPrice = (price: number) => {
  const priceInMillions = price / 1000000;

  return `${Number.isInteger(priceInMillions) ? priceInMillions : priceInMillions.toFixed(1)}tr`;
};

const SearchResultsMapComponent = ({
  listings,
  selectedListingId,
  onSelectListing,
}: SearchResultsMapProps) => {
  const markers = useMemo(
    () => listings.filter((listing) => listing.location !== undefined),
    [listings]
  );

  return (
    <View style={styles.map}>
      <View style={[styles.road, styles.horizontalRoad]} />
      <View style={[styles.road, styles.verticalRoad]} />
      <View style={[styles.road, styles.diagonalRoad]} />
      {markers.map((listing, index) => {
        const isSelected = listing.id === selectedListingId;
        const left = `${10 + ((index * 23) % 76)}%` as `${number}%`;
        const top = `${12 + ((index * 31) % 68)}%` as `${number}%`;

        return (
          <Pressable
            key={listing.id}
            style={[styles.marker, { left, top }, isSelected && styles.selectedMarker]}
            onPress={() => onSelectListing(listing.id)}
            accessibilityRole="button"
            accessibilityLabel={`${listing.title}, ${formatShortPrice(listing.price)}`}
          >
            <Typography
              variant="caption"
              weight="BOLD"
              color={isSelected ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PRIMARY}
            >
              {formatShortPrice(listing.price)}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

export const SearchResultsMap = memo(SearchResultsMapComponent);

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden', backgroundColor: '#E8EDE5' },
  road: { position: 'absolute', backgroundColor: THEME_COLORS.SURFACE },
  horizontalRoad: { left: 0, right: 0, top: '54%', height: 14 },
  verticalRoad: { top: 0, bottom: 0, left: '42%', width: 12 },
  diagonalRoad: {
    top: '20%',
    left: '-10%',
    width: '125%',
    height: 9,
    transform: [{ rotate: '-18deg' }],
  },
  marker: {
    position: 'absolute',
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
  },
  selectedMarker: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY },
});
