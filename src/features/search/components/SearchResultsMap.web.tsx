import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { SearchListingItem, SearchListingLocation, SearchSchool } from '../types';
import { formatShortPrice } from '../utils';

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

const SearchResultsMapComponent = ({
  listings,
  selectedListingId,
  school,
  onSelectListing,
  onOpenListing,
  onPressMap,
}: SearchResultsMapProps) => {
  const markers = useMemo(
    () => listings.filter((listing) => listing.location !== undefined),
    [listings]
  );

  return (
    <Pressable style={styles.map} onPress={onPressMap} accessible={false}>
      <View style={styles.tint} />
      <View style={[styles.road, styles.horizontalRoad]} />
      <View style={[styles.road, styles.verticalRoad]} />
      <View style={[styles.road, styles.secondaryRoad]} />
      {school ? (
        <View style={styles.schoolMarker}>
          <GraduationCap size={12} color={THEME_COLORS.WHITE} />
          <Typography variant="tiny" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
            {school.shortName}
          </Typography>
        </View>
      ) : null}
      {markers.map((listing, index) => {
        const isSelected = listing.id === selectedListingId;
        const left = `${10 + ((index * 23) % 66)}%` as `${number}%`;
        const top = `${14 + ((index * 31) % 50)}%` as `${number}%`;

        return (
          <Pressable
            key={listing.id}
            style={[styles.marker, { left, top }, isSelected && styles.selectedMarker]}
            onPress={() =>
              listing.id === selectedListingId && onOpenListing
                ? onOpenListing(listing.id)
                : onSelectListing(listing.id)
            }
            accessibilityRole="button"
            accessibilityLabel={`${listing.title}, ${formatShortPrice(listing.price)}`}
          >
            <Typography
              variant="label"
              weight="BOLD"
              color={isSelected ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_PRIMARY}
            >
              {formatShortPrice(listing.price)}
            </Typography>
          </Pressable>
        );
      })}
    </Pressable>
  );
};

export const SearchResultsMap = memo(SearchResultsMapComponent);

const styles = StyleSheet.create({
  map: { flex: 1, overflow: 'hidden', backgroundColor: OVERLAY_COLORS.MAP_LAND },
  tint: { top: 0, right: 0, bottom: 0, left: 0, backgroundColor: OVERLAY_COLORS.MAP_TINT },
  road: { position: 'absolute', backgroundColor: THEME_COLORS.WHITE },
  horizontalRoad: { left: 0, right: 0, top: '38%', height: 12 },
  verticalRoad: { top: 0, bottom: 0, left: '25%', width: 11 },
  secondaryRoad: { top: 0, bottom: 0, left: '72%', width: 7 },
  schoolMarker: {
    position: 'absolute',
    top: '28%',
    left: '11%',
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
  marker: {
    position: 'absolute',
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
  },
  selectedMarker: { backgroundColor: THEME_COLORS.PRIMARY },
});
