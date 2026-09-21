import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Sparkles, MessageSquare, User } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import type { MainTabParamList } from '../types';
import { HomeScreen, LandlordListingsScreen, LandlordPlaceholderScreen } from '@features/listings';
import { SearchScreen } from '@features/search';
import { AiChatScreen } from '@features/ai-chat';
import { MessagesScreen } from '@features/chat';
import { ProfileScreen } from '@features/auth';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 22;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_MUTED,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: THEME_COLORS.SURFACE,
          borderTopColor: THEME_COLORS.BORDER,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
        },
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
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={props.onPress ?? undefined}
              accessibilityLabel="Trợ lý AI"
              style={styles.aiTabButton}
              activeOpacity={0.85}
            >
              <View style={styles.aiButtonCircle}>
                <Sparkles size={24} color={THEME_COLORS.WHITE} />
              </View>

              <Text style={styles.aiTabLabel}>Trợ lý AI</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Tin nhắn',
          tabBarBadge: 2,
          tabBarBadgeStyle: styles.badgeStyle,
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

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  aiTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  aiButtonCircle: {
    width: 48,
    height: 48,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    elevation: 6,
    shadowColor: THEME_COLORS.PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  aiTabLabel: {
    marginTop: 4,
    color: THEME_COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: '600',
  },
  badgeStyle: {
    backgroundColor: THEME_COLORS.ERROR,
    color: THEME_COLORS.WHITE,
    fontSize: 10,
    fontWeight: '700',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 16,
  },
});
