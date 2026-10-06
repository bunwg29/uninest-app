import { apiClient } from '@core';
import type {
  LandlordListing,
  LandlordListingStatus,
  LandlordListingsPage,
} from '../types/landlord';

type ApiListingStatus =
  'active' | 'pending' | 'rejected' | 'hidden' | 'rented' | 'paused' | 'deleted';

interface ApiLandlordListing extends Omit<LandlordListing, 'status'> {
  status: ApiListingStatus;
}

interface ApiLandlordListingsPage {
  items: ApiLandlordListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  countsByStatus: Record<ApiListingStatus, number>;
}

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const getApiStatus = (status: LandlordListingStatus): ApiListingStatus => {
  if (status === 'published') return 'active';

  if (status === 'expired') return 'rented';

  if (status === 'paused') return 'paused';

  return status;
};

const getAppStatus = (status: ApiListingStatus): LandlordListingStatus => {
  if (status === 'active') return 'published';

  if (status === 'rented' || status === 'deleted') return 'expired';

  return status;
};

const mapPage = (page: ApiLandlordListingsPage): LandlordListingsPage => ({
  items: page.items.map((listing) => ({ ...listing, status: getAppStatus(listing.status) })),
  totalCount: page.pagination.total,
  counters: {
    published: page.countsByStatus.active ?? 0,
    pending: page.countsByStatus.pending ?? 0,
    rejected: page.countsByStatus.rejected ?? 0,
    hidden: page.countsByStatus.hidden ?? 0,
    expired: page.countsByStatus.rented ?? 0,
    paused: page.countsByStatus.paused ?? 0,
  },
  page: page.pagination.page,
  totalPages: page.pagination.totalPages,
});

export const landlordListingsService = {
  async getListings(
    status: LandlordListingStatus,
    page: number,
    keyword?: string
  ): Promise<LandlordListingsPage> {
    const response = await apiClient.get('/landlord/listings', {
      params: { status: getApiStatus(status), keyword: keyword || undefined, page, limit: 10 },
    });

    return mapPage(unwrapData<ApiLandlordListingsPage>(response.data));
  },

  async getListing(id: string): Promise<LandlordListing> {
    const response = await apiClient.get(`/landlord/listings/${id}`);
    const listing = unwrapData<ApiLandlordListing>(response.data);

    return { ...listing, status: getAppStatus(listing.status) };
  },

  async hideListing(id: string): Promise<void> {
    await apiClient.patch(`/landlord/listings/${id}/visibility`, { hidden: true });
  },

  async republishListing(id: string): Promise<void> {
    await apiClient.patch(`/landlord/listings/${id}/visibility`, { hidden: false });
  },

  async markRented(id: string): Promise<void> {
    await apiClient.patch(`/landlord/listings/${id}/rental-status`, { rented: true });
  },

  async markAvailable(id: string): Promise<void> {
    await apiClient.patch(`/landlord/listings/${id}/rental-status`, { rented: false });
  },

  async deleteListing(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete(`/landlord/listings/${id}`);
    const result = unwrapData<{ deleted?: boolean } | null>(response.data);

    return { deleted: result?.deleted !== false };
  },
};
