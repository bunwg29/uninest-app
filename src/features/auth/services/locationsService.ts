import { apiClient, unwrapApiData } from '@core';

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

export const locationsService = {
  async getProvinces(): Promise<LocationProvince[]> {
    const response = await apiClient.get('/locations/provinces');

    return unwrapApiData<LocationProvince[]>(response.data);
  },

  async getWardsByProvince(provinceCode: string): Promise<LocationWard[]> {
    const response = await apiClient.get(`/locations/provinces/${provinceCode}/wards`);

    return unwrapApiData<LocationWard[]>(response.data);
  },
};
