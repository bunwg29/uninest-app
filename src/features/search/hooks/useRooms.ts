import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../services';

const ROOMS_QUERY_KEY = ['rooms'] as const;

export const useRooms = () =>
  useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: () => roomsApi.list(),
    staleTime: 5 * 60 * 1000,
  });

export const useRoom = (id: string | undefined) =>
  useQuery({
    queryKey: [...ROOMS_QUERY_KEY, id ?? ''],
    queryFn: () => roomsApi.getOne(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
