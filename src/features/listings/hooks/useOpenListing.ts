import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@features/auth/hooks';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation/types';
import { landlordListingsService } from '../services';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useOpenListing = () => {
  const navigation = useNavigation<NavigationProp>();
  const { role } = useAuth();
  const toast = useToast();
  const [isOpening, setIsOpening] = useState(false);

  const openListing = async (listingId: string) => {
    if (role !== 'landlord') {
      navigation.navigate('ListingDetail', { id: listingId });

      return;
    }

    setIsOpening(true);

    try {
      const listing = await landlordListingsService.getListing(listingId);

      navigation.navigate('LandlordListingDetail', { listing });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể mở chi tiết phòng');
    } finally {
      setIsOpening(false);
    }
  };

  return { openListing, isOpening };
};
