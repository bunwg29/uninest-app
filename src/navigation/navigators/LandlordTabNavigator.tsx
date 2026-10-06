import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, Grid2X2, Home, MessageSquare, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LandlordAppointmentsScreen, useLandlordBookings } from '@features/booking';
import { LandlordListingsScreen, LandlordOverviewScreen } from '@features/listings';
import { useListingPostStore } from '@features/listings/store/listingPostStore';
import { MessagesScreen, useChatSummary } from '@features/chat';
import { Text } from 'react-native';
import { THEME_COLORS } from '@theme';
import type { LandlordTabParamList, RootStackParamList } from '../types';
import { BOTTOM_TAB_STYLES, PrimaryTabButton } from '../components/PrimaryTabButton';

const Tab = createBottomTabNavigator<LandlordTabParamList>();
const TAB_ICON_SIZE = 22;

const EmptyCreateScreen = () => null;

export const LandlordTabNavigator = () => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: chatSummary } = useChatSummary();
  const { data: landlordBookings } = useLandlordBookings();
  const pendingAppointments =
    landlordBookings?.items.filter((booking) => booking.status === 'pending').length ?? 0;
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.PRIMARY_DARK,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_PLACEHOLDER,
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={[BOTTOM_TAB_STYLES.label, { color, fontWeight: focused ? '700' : '500' }]}>
            {children}
          </Text>
        ),
        tabBarStyle: [
          BOTTOM_TAB_STYLES.bar,
          { height: 64 + bottomPadding, paddingBottom: bottomPadding },
        ],
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
          tabBarBadge: pendingAppointments > 0 ? pendingAppointments : undefined,
          tabBarBadgeStyle: BOTTOM_TAB_STYLES.badge,
          tabBarIcon: ({ color }) => <CalendarDays size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Tin nhắn',
          tabBarBadge: chatSummary?.unreadMessages ? chatSummary.unreadMessages : undefined,
          tabBarBadgeStyle: BOTTOM_TAB_STYLES.badge,
          tabBarIcon: ({ color }) => <MessageSquare size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
