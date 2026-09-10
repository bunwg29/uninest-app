import { useQuery } from '@tanstack/react-query';
import { landlordListingsService } from '../services';

export const LANDLORD_DASHBOARD_QUERY_KEY = ['landlord-dashboard'];

export const useLandlordDashboard = () => {
  return useQuery({
    queryKey: LANDLORD_DASHBOARD_QUERY_KEY,
    queryFn: landlordListingsService.getDashboard,
  });
};
