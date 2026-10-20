import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { LandlordVerificationScreen, authService, useRoleGuard } from '@features/auth';
import { useToast } from '@hooks';
import type { ListingPostStackParamList, RootStackParamList } from '../types';
import {
  BasicInfoScreen,
  ImagesScreen,
  LocationScreen,
  AmenitiesScreen,
  ViewingScheduleScreen,
  PreviewScreen,
  SuccessScreen,
} from '@features/listings';

const Stack = createNativeStackNavigator<ListingPostStackParamList>();

export const ListingPostNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const { isLandlord, isAuthenticated } = useRoleGuard();

  useEffect(() => {
    if (!isAuthenticated || !isLandlord) {
      toast.error('Chức năng đăng tin chỉ dành cho tài khoản Chủ trọ');
      navigation.navigate('Main');
    }
  }, [isAuthenticated, isLandlord, navigation, toast]);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated && isLandlord,
  });

  if (!isAuthenticated || !isLandlord) {
    return null;
  }

  if (profileQuery.data?.verificationStatus === 'pending_verification') {
    return <LandlordVerificationScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="ListingPostBasicInfo"
      screenOptions={{ headerShown: false, freezeOnBlur: true }}
    >
      <Stack.Screen name="ListingPostBasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="ListingPostImages" component={ImagesScreen} />
      <Stack.Screen name="ListingPostLocation" component={LocationScreen} />
      <Stack.Screen name="ListingPostAmenities" component={AmenitiesScreen} />
      <Stack.Screen name="ListingPostSchedule" component={ViewingScheduleScreen} />
      <Stack.Screen name="ListingPostPreview" component={PreviewScreen} />
      <Stack.Screen name="ListingPostSuccess" component={SuccessScreen} />
    </Stack.Navigator>
  );
};
