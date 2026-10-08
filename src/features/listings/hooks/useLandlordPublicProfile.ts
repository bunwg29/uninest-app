import { useQuery } from '@tanstack/react-query';
import { landlordListingsService } from '../services';

export const LANDLORD_PUBLIC_PROFILE_QUERY_KEY = 'landlord-public-profile';

export const useLandlordPublicProfile = (landlordId: string) =>
  useQuery({
    queryKey: [LANDLORD_PUBLIC_PROFILE_QUERY_KEY, landlordId],
    queryFn: () => landlordListingsService.getPublicProfile(landlordId),
    enabled: Boolean(landlordId),
  });
