import type { SearchListingItem, SearchListingLocation } from '../types';

export interface MapRegionBounds {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export type MapCluster =
  | { type: 'listing'; key: string; listing: SearchListingItem; location: SearchListingLocation }
  | {
      type: 'cluster';
      key: string;
      count: number;
      listingIds: string[];
      location: SearchListingLocation;
    };

const GRID_DIVISIONS = 6;
const MIN_CLUSTER_ZOOM_DELTA = 0.012;

export const clusterListings = (
  listings: SearchListingItem[],
  region: MapRegionBounds,
  selectedListingId: string | null
): MapCluster[] => {
  const located = listings.filter(
    (listing): listing is SearchListingItem & { location: SearchListingLocation } =>
      listing.location !== undefined
  );

  if (region.latitudeDelta <= MIN_CLUSTER_ZOOM_DELTA) {
    return located.map((listing) => ({
      type: 'listing',
      key: listing.id,
      listing,
      location: listing.location,
    }));
  }

  const cellLatitude = region.latitudeDelta / GRID_DIVISIONS;
  const cellLongitude = region.longitudeDelta / GRID_DIVISIONS;
  const cells = new Map<string, Array<SearchListingItem & { location: SearchListingLocation }>>();

  located.forEach((listing) => {
    const cellKey = `${Math.floor(listing.location.latitude / cellLatitude)}:${Math.floor(
      listing.location.longitude / cellLongitude
    )}`;
    const members = cells.get(cellKey);

    if (members) {
      members.push(listing);
    } else {
      cells.set(cellKey, [listing]);
    }
  });

  return Array.from(cells.entries()).flatMap(([cellKey, members]): MapCluster[] => {
    const hasSelected = members.some((member) => member.id === selectedListingId);

    if (members.length === 1 || hasSelected) {
      return members.map((member) => ({
        type: 'listing',
        key: member.id,
        listing: member,
        location: member.location,
      }));
    }

    return [
      {
        type: 'cluster',
        key: `cluster-${cellKey}`,
        count: members.length,
        listingIds: members.map((member) => member.id),
        location: {
          latitude:
            members.reduce((total, member) => total + member.location.latitude, 0) / members.length,
          longitude:
            members.reduce((total, member) => total + member.location.longitude, 0) /
            members.length,
        },
      },
    ];
  });
};
