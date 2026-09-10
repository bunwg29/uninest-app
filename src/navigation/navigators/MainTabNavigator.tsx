import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, Grid2X2, House, MessageCircle, Plus } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import type { MainTabParamList } from '../types';
import { HomeScreen, LandlordListingsScreen, LandlordPlaceholderScreen } from '@features/listings';
import { MessagesScreen } from '@features/chat';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 21;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{
        tabBarActiveTintColor: THEME_COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME_COLORS.TEXT_MUTED,
        tabBarStyle: {
          backgroundColor: THEME_COLORS.SURFACE,
          borderTopColor: THEME_COLORS.BORDER,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerStyle: { backgroundColor: THEME_COLORS.SURFACE },
        headerTintColor: THEME_COLORS.TEXT_PRIMARY,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={HomeScreen}
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
          tabBarIcon: ({ color }) => <House size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="CreateListing"
        component={LandlordPlaceholderScreen}
        options={{
          title: 'Đăng tin',
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={props.onPress ?? undefined}
              accessibilityLabel="Đăng tin"
              style={styles.createTabButton}
            >
              <View style={styles.createButtonCircle}>
                <Plus size={26} color={THEME_COLORS.WHITE} />
              </View>
              <Text style={styles.createTabLabel}>Đăng tin</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Appointments"
        component={LandlordPlaceholderScreen}
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ color }) => <CalendarDays size={TAB_ICON_SIZE} color={color} />,
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <MessageCircle size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  createTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  createButtonCircle: {
    width: 50,
    height: 50,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
    elevation: 5,
    shadowColor: THEME_COLORS.BLACK,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  createTabLabel: {
    marginTop: 3,
    color: THEME_COLORS.TEXT_MUTED,
    fontSize: 11,
  },
});
