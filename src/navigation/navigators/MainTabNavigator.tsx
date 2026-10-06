import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Sparkles, MessageSquare, User } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';
import type { MainTabParamList } from '../types';
import { HomeScreen, LandlordListingsScreen, LandlordPlaceholderScreen } from '@features/listings';
import { SearchScreen } from '@features/search';
import { AiChatScreen } from '@features/ai-chat';
import { MessagesScreen, useChatSummary } from '@features/chat';
import { ProfileScreen } from '@features/auth';
import { useRoleGuard } from '@features/auth';
import { LandlordTabNavigator } from './LandlordTabNavigator';
import { BOTTOM_TAB_STYLES, PrimaryTabButton } from '../components/PrimaryTabButton';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 22;

export const MainTabNavigator = () => {
  const { isLandlord } = useRoleGuard();
  const { data: chatSummary } = useChatSummary(!isLandlord);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  if (isLandlord) {
    return <LandlordTabNavigator />;
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_PLACEHOLDER,
        tabBarLabelStyle: BOTTOM_TAB_STYLES.label,
        tabBarStyle: [
          BOTTOM_TAB_STYLES.bar,
          { height: 64 + bottomPadding, paddingBottom: bottomPadding },
        ],
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Home size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Tìm trọ',
          tabBarIcon: ({ color }) => <Search size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{
          title: 'Trợ lý AI',
          tabBarButton: ({ onPress }) => (
            <PrimaryTabButton
              onPress={onPress ?? undefined}
              accessibilityLabel="Trợ lý AI"
              label="Trợ lý AI"
              icon={<Sparkles size={24} color={THEME_COLORS.WHITE} />}
            />
          ),
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

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <User size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Overview"
        component={HomeScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Listings"
        component={LandlordListingsScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="CreateListing"
        component={LandlordPlaceholderScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Appointments"
        component={LandlordPlaceholderScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};
