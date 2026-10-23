export type PriceAggregateAreaLevel = 'province' | 'ward';

export type PriceComparisonRoomType =
  'phong_tro' | 'nha_nguyen_can' | 'chung_cu_mini' | 'ky_tuc_xa' | 'studio' | 'can_ho_dich_vu';

export interface PriceComparisonItem {
  areaLevel: PriceAggregateAreaLevel;
  areaCode: string;
  area: string;
  provinceCode: string;
  roomType: PriceComparisonRoomType;
  avgPrice: number | null;
  popularPriceMin: number | null;
  popularPriceMax: number | null;
  sampleCount: number;
  unit: string;
  dataFrom: string;
  dataTo: string;
  computedAt: string;
  warning: string | null;
}

export interface PriceComparisonResponse {
  items: PriceComparisonItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PriceComparisonQuery {
  areaLevel?: PriceAggregateAreaLevel;
  provinceCode?: string;
  wardCode?: string;
  roomType?: PriceComparisonRoomType;
  page?: number;
  limit?: number;
}

export interface InterestedPriceMarker {
  id: string;
  title: string;
  price: number;
}
