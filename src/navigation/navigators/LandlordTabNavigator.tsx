import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, Grid2X2, Home, MessageSquare, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LandlordAppointmentsScreen } from '@features/booking';
import { LandlordListingsScreen, LandlordOverviewScreen } from '@features/listings';
import { useListingPostStore } from '@features/listings/store/listingPostStore';
import { MessagesScreen } from '@features/chat';
import { THEME_COLORS } from '@theme';
import type { LandlordTabParamList, RootStackParamList } from '../types';
import { BOTTOM_TAB_STYLES, PrimaryTabButton } from '../components/PrimaryTabButton';

const Tab = createBottomTabNavigator<LandlordTabParamList>();
const TAB_ICON_SIZE = 22;

const EmptyCreateScreen = () => null;

export const LandlordTabNavigator = () => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_PLACEHOLDER,
        tabBarLabelStyle: BOTTOM_TAB_STYLES.label,
        tabBarStyle: BOTTOM_TAB_STYLES.bar,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={LandlordOverviewScreen}
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color }) => <Grid2X2 size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="Listings"
        component={LandlordListingsScreen}
        options={{
          title: 'Tin đăng',
          tabBarIcon: ({ color }) => <Home size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="CreateListing"
        component={EmptyCreateScreen}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            useListingPostStore.getState().initCreate();
            rootNavigation.navigate('ListingPost', {
              screen: 'ListingPostBasicInfo',
              params: undefined,
            });
          },
        }}
        options={{
          title: 'Đăng tin',
          tabBarButton: ({ onPress }) => (
            <PrimaryTabButton
              onPress={onPress ?? undefined}
              accessibilityLabel="Đăng tin"
              label="Đăng tin"
              icon={<Plus size={28} strokeWidth={2.4} color={THEME_COLORS.WHITE} />}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={LandlordAppointmentsScreen}
        options={{
          title: 'Lịch hẹn',
          tabBarBadge: 2,
          tabBarBadgeStyle: BOTTOM_TAB_STYLES.badge,
          tabBarIcon: ({ color }) => <CalendarDays size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Tin nhắn',
          tabBarBadge: 1,
          tabBarBadgeStyle: BOTTOM_TAB_STYLES.badge,
          tabBarIcon: ({ color }) => <MessageSquare size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
