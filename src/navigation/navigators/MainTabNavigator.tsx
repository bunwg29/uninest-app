import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, MessageSquare, Users, User } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';
import type { MainTabParamList } from '../types';
import { HomeScreen } from '@features/listings';
import { SearchScreen } from '@features/search';
import { MessagesScreen } from '@features/chat';
import { CommunityScreen } from '@features/forum';
import { ProfileScreen } from '@features/auth';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 22;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: THEME_COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_MUTED,
        tabBarStyle: {
          backgroundColor: THEME_COLORS.SURFACE,
          borderTopColor: THEME_COLORS.BORDER,
        },
        headerStyle: { backgroundColor: THEME_COLORS.SURFACE },
        headerTintColor: THEME_COLORS.TEXT_PRIMARY,
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
          title: 'Tìm kiếm',
          tabBarIcon: ({ color }) => <Search size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <MessageSquare size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'Cộng đồng',
          tabBarIcon: ({ color }) => <Users size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <User size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
