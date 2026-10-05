import { apiClient } from '@core';
import type { Room } from '../types';

const unwrapData = <T>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

export const roomsApi = {
  async list(): Promise<Room[]> {
    const response = await apiClient.get('/rooms');

    return unwrapData<Room[]>(response.data);
  },

  async getOne(id: string): Promise<Room> {
    const response = await apiClient.get(`/rooms/${id}`);

    return unwrapData<Room>(response.data);
  },
};
