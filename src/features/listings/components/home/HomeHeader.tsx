import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bell, Columns2, ListFilter, MapPin, Search } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Avatar, GradientView, Typography } from '@ui';

export interface HomeHeaderProps {
  displayName: string;
  avatarUrl?: string | null;
  locationText: string;
  subtitle?: string;
  comparisonCount: number;
  hasUnreadNotifications: boolean;
  onProfilePress: () => void;
  onComparisonPress: () => void;
  onNotificationsPress: () => void;
  onSearchPress: () => void;
  onFilterPress: () => void;
}

const AVATAR_SIZE = 40;
const BUTTON_SIZE = 40;

export const HomeHeader = ({
  displayName,
  avatarUrl,
  locationText,
  subtitle,
  comparisonCount,
  hasUnreadNotifications,
  onProfilePress,
  onComparisonPress,
  onNotificationsPress,
  onSearchPress,
  onFilterPress,
}: HomeHeaderProps) => {
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityLabel="Mở trang cá nhân"
        >
          {avatarUrl ? (
            <Avatar uri={avatarUrl} name={displayName} size="md" />
          ) : (
            <GradientView
              colors={[OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT]}
              style={styles.avatar}
            >
              <View style={styles.avatarInitial}>
                <Typography variant="body2" weight="BOLD" color={THEME_COLORS.PRIMARY_DARK}>
                  {initial}
                </Typography>
              </View>
            </GradientView>
          )}

          <View style={styles.greeting}>
            <Typography
              variant="body2"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              numberOfLines={1}
              style={styles.greetingText}
            >
              {`Chào ${displayName} 👋`}
            </Typography>

            {subtitle ? (
              <Typography
                variant="caption"
                weight="MEDIUM"
                colorKey="TEXT_PLACEHOLDER"
                numberOfLines={1}
                style={styles.subtitle}
              >
                {subtitle}
              </Typography>
            ) : (
              <View style={styles.locationRow}>
                <MapPin size={13} color={THEME_COLORS.TEXT_PLACEHOLDER} />

                <Typography
                  variant="caption"
                  weight="MEDIUM"
                  colorKey="TEXT_PLACEHOLDER"
                  numberOfLines={1}
                  style={styles.locationText}
                >
                  {locationText}
                </Typography>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onComparisonPress}
          activeOpacity={0.7}
          accessibilityLabel="Mở danh sách so sánh"
        >
          <Columns2 size={21} color={THEME_COLORS.TEXT_PRIMARY} />

          {comparisonCount > 0 ? (
            <View style={styles.comparisonBadge}>
              <Typography
                variant="tiny"
                weight="BOLD"
                color={THEME_COLORS.WHITE}
                style={styles.badgeText}
              >
                {comparisonCount}
              </Typography>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          accessibilityLabel="Thông báo"
        >
          <Bell size={21} color={THEME_COLORS.TEXT_PRIMARY} />

          {hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TouchableOpacity
          style={styles.searchField}
          onPress={onSearchPress}
          activeOpacity={0.8}
          accessibilityLabel="Tìm kiếm phòng"
        >
          <Search size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />

          <Typography
            variant="body2"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={1}
            style={styles.searchPlaceholder}
          >
            Tìm theo khu vực, tên đường…
          </Typography>
        </TouchableOpacity>

        <View style={styles.searchDivider} />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
          accessibilityLabel="Mở bộ lọc"
        >
          <ListFilter size={20} color={THEME_COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXS,
    paddingBottom: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  topRow: {
    height: BUTTON_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD - SPACING_TOKENS.XXS,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING_TOKENS.SM,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  avatarInitial: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    flex: 1,
    marginLeft: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  greetingText: {
    lineHeight: 22,
  },
  subtitle: {
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: SPACING_TOKENS.XS,
    letterSpacing: 0.2,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    marginLeft: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.WHITE,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    lineHeight: 14,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.WHITE,
    backgroundColor: THEME_COLORS.ERROR,
  },
  searchBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  searchField: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: SPACING_TOKENS.SM,
    lineHeight: 22,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  filterButton: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: SPACING_TOKENS.SM,
    paddingRight: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
});
