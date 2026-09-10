import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  MessageSquare,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { useLandlordDashboard, useLandlordListings } from '../hooks';
import type { MainTabParamList } from '@navigation';

export const HomeScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const insets = useSafeAreaInsets();
  const dashboardQuery = useLandlordDashboard();
  const listingsQuery = useLandlordListings('published');
  const dashboard = dashboardQuery.data;
  const listings = useMemo(
    () => listingsQuery.data?.pages.flatMap((page) => page.items).slice(0, 2) || [],
    [listingsQuery.data]
  );

  const handleRefresh = () => {
    void Promise.all([dashboardQuery.refetch(), listingsQuery.refetch()]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isRefetching || listingsQuery.isRefetching}
          onRefresh={handleRefresh}
          tintColor={THEME_COLORS.PRIMARY}
        />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING_TOKENS.SM }]}>
        <View style={styles.avatar}>
          <Typography variant="h3" weight="BOLD" color={THEME_COLORS.WARNING}>
            {getInitials(dashboard?.profile.fullName)}
          </Typography>
        </View>
        <View style={styles.profileCopy}>
          <Typography variant="h3" weight="BOLD">
            {dashboard?.profile.fullName || 'Chủ trọ'}
          </Typography>
          <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
              <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WARNING}>
                Chủ trọ
              </Typography>
            </View>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              {dashboard?.profile.listingCount || 0} phòng
            </Typography>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton} accessibilityLabel="Thông báo">
          <Bell size={21} color={THEME_COLORS.TEXT_PRIMARY} />
          <View style={styles.notificationBadge}>
            <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WHITE}>
              {dashboard?.pendingTasks.count || 0}
            </Typography>
          </View>
        </TouchableOpacity>
      </View>

      {dashboardQuery.isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      ) : (
        <>
          <View style={styles.featuredBanner}>
            <View style={styles.featuredIcon}>
              <Star size={21} color={THEME_COLORS.TEXT_PRIMARY} fill={THEME_COLORS.TEXT_PRIMARY} />
            </View>
            <View style={styles.featuredCopy}>
              <Typography variant="body1" weight="BOLD">
                {dashboard?.featured.isActive
                  ? `Gói Nổi bật còn ${dashboard.featured.remainingDays} ngày`
                  : 'Gói Nổi bật đã hết hạn'}
              </Typography>
              <Typography variant="caption" colorKey="WARNING">
                Gia hạn để tin tiếp tục lên đầu kết quả
              </Typography>
            </View>
            <TouchableOpacity style={styles.extendButton}>
              <Typography variant="body2" weight="BOLD" color={THEME_COLORS.TEXT_PRIMARY}>
                Gia hạn
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Typography variant="h2" weight="BOLD">
              {dashboard?.period || '7 ngày qua'}
            </Typography>
            <TouchableOpacity style={styles.periodButton}>
              <Typography variant="caption">7 ngày</Typography>
              <ChevronRight size={15} color={THEME_COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard
              label="Lượt xem tin"
              value={dashboard?.metrics.views || 0}
              trend="+18% so với tuần trước"
              positive
            />
            <MetricCard
              label="Lượt liên hệ"
              value={dashboard?.metrics.contacts || 0}
              trend="+6 lượt"
              positive
            />
            <MetricCard
              label="Yêu cầu xem phòng"
              value={dashboard?.metrics.viewingRequests || 0}
              trend="−2 so với tuần trước"
            />
            <MetricCard
              label="Tỉ lệ phản hồi"
              value={`${dashboard?.metrics.responseRate || 0}%`}
              trend="Trung bình ~10 phút"
              positive
            />
          </View>

          <View style={styles.tasksCard}>
            <Typography variant="h3" weight="BOLD">
              Cần bạn xử lý
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.taskSubtitle}>
              {dashboard?.pendingTasks.count || 0} việc đang chờ
            </Typography>
            <View style={styles.divider} />
            {dashboard?.pendingTasks.items.length ? (
              dashboard.pendingTasks.items.map((task) => (
                <TaskRow
                  key={task.type}
                  title={`${task.count} ${task.title}`}
                  subtitle="Mở để xử lý ngay"
                  icon="calendar"
                />
              ))
            ) : (
              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.emptyTask}>
                Bạn đã xử lý hết các việc đang chờ.
              </Typography>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Typography variant="h2" weight="BOLD">
              Tin đăng của bạn
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('Listings')}>
              <Typography variant="body2" weight="BOLD" color={THEME_COLORS.PRIMARY}>
                Xem tất cả
              </Typography>
            </TouchableOpacity>
          </View>
          {listings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingRow}
              onPress={() => navigation.navigate('Listings')}
            >
              <View style={styles.listingDot} />
              <View style={styles.listingCopy}>
                <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
                  {listing.title}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  {formatCurrency(listing.price)}đ /tháng · {listing.area} m²
                </Typography>
              </View>
              <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const MetricCard = ({
  label,
  value,
  trend,
  positive = false,
}: {
  label: string;
  value: number | string;
  trend: string;
  positive?: boolean;
}) => (
  <View style={styles.metricCard}>
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="h1" weight="BOLD" style={styles.metricValue}>
      {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
    </Typography>
    <View style={styles.trendRow}>
      {positive ? (
        <TrendingUp size={13} color={THEME_COLORS.SUCCESS} />
      ) : (
        <TrendingDown size={13} color={THEME_COLORS.WARNING} />
      )}
      <Typography
        variant="tiny"
        weight="SEMIBOLD"
        color={positive ? THEME_COLORS.SUCCESS : THEME_COLORS.WARNING}
      >
        {trend}
      </Typography>
    </View>
  </View>
);

const TaskRow = ({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: 'calendar';
}) => (
  <TouchableOpacity style={styles.taskRow}>
    <View style={styles.taskIcon}>
      {icon === 'calendar' ? (
        <CalendarDays size={17} color={THEME_COLORS.PRIMARY} />
      ) : (
        <MessageSquare size={17} color={THEME_COLORS.PRIMARY} />
      )}
    </View>
    <View style={styles.taskCopy}>
      <Typography variant="body2" weight="SEMIBOLD">
        {title}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        {subtitle}
      </Typography>
    </View>
    <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
  </TouchableOpacity>
);

function getInitials(fullName?: string): string {
  return (fullName || 'Chủ trọ')
    .split(' ')
    .map((part) => part[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  content: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: '#FFE8B0',
  },
  profileCopy: { flex: 1, marginLeft: SPACING_TOKENS.SM },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: '#F5C56B',
    backgroundColor: '#FFF8E6',
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
  },
  featuredBanner: {
    margin: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5C56B',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: '#FFF9EA',
  },
  featuredIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: '#F9A825',
  },
  featuredCopy: { flex: 1, marginHorizontal: SPACING_TOKENS.SM },
  extendButton: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: '#F9A825',
  },
  sectionHeader: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodButton: {
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    borderWidth: 1,
    borderColor: '#C9D2E3',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  metricsGrid: {
    marginHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  metricCard: {
    width: '48%',
    minHeight: 120,
    padding: SPACING_TOKENS.SM + 2,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  metricValue: { marginTop: SPACING_TOKENS.XS, marginBottom: SPACING_TOKENS.XS },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  tasksCard: {
    margin: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  taskSubtitle: { marginTop: 2 },
  divider: { height: 1, marginVertical: SPACING_TOKENS.SM, backgroundColor: THEME_COLORS.DIVIDER },
  taskRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  taskIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  taskCopy: { flex: 1, marginHorizontal: SPACING_TOKENS.SM },
  emptyTask: { paddingVertical: SPACING_TOKENS.SM },
  listingRow: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  listingDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS,
  },
  listingCopy: { flex: 1, marginHorizontal: SPACING_TOKENS.SM },
  loadingState: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
});
