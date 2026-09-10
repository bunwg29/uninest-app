import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ListingPostStackParamList } from '../types';
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
  return (
    <Stack.Navigator initialRouteName="ListingPostBasicInfo" screenOptions={{ headerShown: false }}>
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
