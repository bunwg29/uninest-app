import { apiClient } from '@core';
import type {
  LandlordDashboard,
  LandlordListing,
  LandlordListingStatus,
  LandlordListingsPage,
} from '../types/landlord';

const BASE_PATH = '/landlord/listings';

type ApiEnvelope<T> = { data: T };

const STATUS_MAP: Record<LandlordListingStatus, string> = {
  published: 'active',
  pending: 'pending',
  rejected: 'rejected',
  hidden: 'hidden',
  expired: 'expired',
};

const mapListing = (listing: Record<string, unknown>): LandlordListing => ({
  id: String(listing.id),
  title: String(listing.title || ''),
  price: Number(listing.price || 0),
  area: Number(listing.area || 0),
  imageUrl: typeof listing.thumbnailUrl === 'string' ? listing.thumbnailUrl : undefined,
  status: listing.status === 'active' ? 'published' : (listing.status as LandlordListingStatus),
  isFeatured: Boolean(listing.isHighlight),
  viewCount: Number((listing.stats as { views?: number } | undefined)?.views || 0),
  contactCount: Number((listing.stats as { contacts?: number } | undefined)?.contacts || 0),
  saveCount: Number((listing.stats as { saves?: number } | undefined)?.saves || 0),
  holdingStatus: false,
});

export const landlordListingsService = {
  async getListings(status: LandlordListingStatus, page: number): Promise<LandlordListingsPage> {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(BASE_PATH, {
      params: { tab: STATUS_MAP[status], page },
    });
    const data = response.data.data;
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const tabsMeta = (data.tabsMeta || {}) as Record<string, number>;

    return {
      items: rawItems.map((item) => mapListing(item as Record<string, unknown>)),
      totalCount: Number(data.totalCount || 0),
      counters: {
        published: Number(tabsMeta.active || 0),
        pending: Number(tabsMeta.pending || 0),
        rejected: Number(tabsMeta.rejected || 0),
        hidden: Number(tabsMeta.hidden || 0),
        expired: Number(tabsMeta.expired || 0),
      },
      page: Number(data.page || page),
      totalPages: Number(data.totalPages || 1),
    };
  },

  async getDashboard(): Promise<LandlordDashboard> {
    const response = await apiClient.get<ApiEnvelope<LandlordDashboard>>(`${BASE_PATH}/dashboard`);

    return response.data.data;
  },

  async hideListing(id: string): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/${id}/toggle-visibility`, { status: 'hidden' });
  },

  async republishListing(id: string): Promise<void> {
    await apiClient.patch(`${BASE_PATH}/${id}/toggle-visibility`, { status: 'active' });
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
