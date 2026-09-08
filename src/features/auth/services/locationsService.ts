import { apiClient } from '@core';

export interface LocationProvince {
  code: string;
  name: string;
  fullName: string;
  codeName: string;
}

export interface LocationWard {
  code: string;
  name: string;
  fullName: string;
  codeName: string;
  provinceCode: string;
  postalCode?: string | null;
}

const unwrapData = <T>(payload: unknown): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { status?: boolean }).status !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const locationsService = {
  async getProvinces(): Promise<LocationProvince[]> {
    const response = await apiClient.get('/locations/provinces');

    return unwrapData<LocationProvince[]>(response.data);
  },

  async getWardsByProvince(provinceCode: string): Promise<LocationWard[]> {
    const response = await apiClient.get(`/locations/provinces/${provinceCode}/wards`);

    return unwrapData<LocationWard[]>(response.data);
  },
};
