export type LandlordListingStatus = 'published' | 'pending' | 'rejected' | 'hidden' | 'expired';

export interface LandlordListing {
  id: string;
  title: string;
  price: number;
  area: number;
  imageUrl?: string;
  status: LandlordListingStatus;
  isFeatured: boolean;
  viewCount: number;
  contactCount: number;
  saveCount: number;
  holdingStatus: boolean;
  holderName?: string;
  holdExpireDate?: string;
  depositAmount?: number;
  rejectionReason?: string;
}

export interface LandlordListingCounters {
  published: number;
  pending: number;
  rejected: number;
  hidden: number;
  expired: number;
}

export interface LandlordDashboard {
  profile: {
    fullName: string;
    role: string;
    listingCount: number;
  };
  featured: {
    isActive: boolean;
    remainingDays: number;
    expiresAt: string | null;
  };
  period: string;
  metrics: {
    views: number;
    contacts: number;
    viewingRequests: number;
    responseRate: number;
  };
  pendingTasks: {
    count: number;
    items: Array<{ type: string; count: number; title: string }>;
  };
  listingCounters: LandlordListingCounters;
}

export interface LandlordListingsPage {
  items: LandlordListing[];
  totalCount: number;
  counters: LandlordListingCounters;
  page: number;
  totalPages: number;
}
