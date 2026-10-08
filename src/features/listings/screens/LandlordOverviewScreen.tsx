import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@features/auth';
import { useLandlordBookings } from '@features/booking/hooks';
import { useChatSummary } from '@features/chat';
import { useToast } from '@hooks';
import type { LandlordTabParamList, RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { GradientAvatar, Modal, ScreenContainer, Typography } from '@ui';
import { LandlordAccountSheet, StatsPeriodSheet } from '../components';
import { useLandlordListings, useLandlordStats } from '../hooks';
import { LANDLORD_STATS_PERIOD_OPTIONS, type LandlordStatsPeriod } from '../types';

type NavigationProp = BottomTabNavigationProp<LandlordTabParamList, 'Overview'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EXPIRING_SOON_HOURS = 12;
const MS_PER_HOUR = 3_600_000;

const formatCount = (value: number) => value.toLocaleString('vi-VN');

const getExpiringHours = (expiresAt: string | null) => {
  if (!expiresAt) return null;

  const hours = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / MS_PER_HOUR);

  return hours > 0 && hours <= EXPIRING_SOON_HOURS ? hours : null;
};

interface StatCardProps {
  label: string;
  value: string;
  note?: string;
  noteColor?: string;
  testID: string;
}

const StatCard = ({
  label,
  value,
  note,
  noteColor = THEME_COLORS.SUCCESS,
  testID,
}: StatCardProps) => (
  <View style={styles.statCard} testID={testID}>
    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
      {label}
    </Typography>
    <Typography weight="BOLD" style={styles.statValue}>
      {value}
    </Typography>
    {note ? (
      <Typography variant="caption" weight="BOLD" color={noteColor}>
        {note}
      </Typography>
    ) : null}
  </View>
);

interface TaskRowProps {
  icon: typeof CalendarDays;
  tone: 'info' | 'warning';
  title: string;
  subtitle: string;
  subtitleColor?: string;
  onPress: () => void;
  testID: string;
  isFirst?: boolean;
}

const TaskRow = ({
  icon: Icon,
  tone,
  title,
  subtitle,
  subtitleColor = THEME_COLORS.TEXT_PLACEHOLDER,
  onPress,
  testID,
  isFirst,
}: TaskRowProps) => (
  <>
    {isFirst ? null : <View style={styles.rowDivider} />}
    <TouchableOpacity
      style={styles.taskRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
    >
      <View
        style={[
          styles.taskIcon,
          {
            backgroundColor:
              tone === 'info' ? THEME_COLORS.PRIMARY_LIGHT : THEME_COLORS.WARNING_LIGHT,
          },
        ]}
      >
        <Icon size={18} color={tone === 'info' ? THEME_COLORS.PRIMARY : THEME_COLORS.WARNING} />
      </View>

      <View style={styles.taskBody}>
        <Typography variant="body2" weight="BOLD" numberOfLines={1}>
          {title}
        </Typography>
        <Typography variant="caption" weight="MEDIUM" color={subtitleColor} numberOfLines={1}>
          {subtitle}
        </Typography>
      </View>

      <ChevronRight size={17} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  </>
);

export const LandlordOverviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState<LandlordStatsPeriod>('7d');
  const [isPeriodVisible, setIsPeriodVisible] = useState(false);
  const [isAccountVisible, setIsAccountVisible] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const publishedQuery = useLandlordListings('published');
  const bookingsQuery = useLandlordBookings();
  const chatSummaryQuery = useChatSummary();
  const statsQuery = useLandlordStats(period);

  const publishedListings = useMemo(
    () => publishedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [publishedQuery.data]
  );
  const counters = publishedQuery.data?.pages[0]?.counters;
  const totalListings = counters ? Object.values(counters).reduce((sum, item) => sum + item, 0) : 0;
  const stats = statsQuery.data;
  const periodOption =
    LANDLORD_STATS_PERIOD_OPTIONS.find((option) => option.value === period) ??
    LANDLORD_STATS_PERIOD_OPTIONS[0];
  const hasFeatured = publishedListings.some((item) => item.isFeatured);

  const pendingBookings = (bookingsQuery.data?.items ?? []).filter(
    (booking) => booking.status === 'pending'
  );
  const expiringHours = pendingBookings
    .map((booking) => getExpiringHours(booking.expiresAt))
    .filter((hours): hours is number => hours !== null);
  const soonestExpiry = expiringHours.length ? Math.min(...expiringHours) : null;
  const unreadMessages = chatSummaryQuery.data?.unreadMessages ?? 0;
  const taskCount = (pendingBookings.length > 0 ? 1 : 0) + (unreadMessages > 0 ? 1 : 0);
  const notificationCount = pendingBookings.length + unreadMessages;

  const handleRefresh = () => {
    void Promise.all([
      publishedQuery.refetch(),
      bookingsQuery.refetch(),
      chatSummaryQuery.refetch(),
      statsQuery.refetch(),
    ]);
  };

  const openFromAccount = (action: () => void) => {
    setIsAccountVisible(false);
    action();
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      toast.info('Đã đăng xuất thành công');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutVisible(false);
    }
  };

  const handleComingSoon = () => toast.info('Tính năng đang được hoàn thiện');

  return (
    <ScreenContainer
      style={styles.screen}
      applyBottomInset={false}
      keyboardAvoiding={false}
      scrollable
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={publishedQuery.isRefetching} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={() => setIsAccountVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Mở menu tài khoản"
          testID="landlord-overview-account"
        >
          <GradientAvatar name={user?.fullName} uri={user?.avatarUrl} size={44} />

          <View style={styles.headerBody}>
            <Typography variant="body2" weight="BOLD" numberOfLines={1}>
              {user?.fullName ?? 'Chủ trọ'}
            </Typography>

            <View style={styles.roleRow}>
              <View style={styles.roleBadge}>
                <Typography variant="tiny" weight="BOLD" colorKey="WARNING" style={styles.roleText}>
                  CHỦ TRỌ
                </Typography>
              </View>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                {totalListings} phòng
              </Typography>
            </View>
          </View>

          <ChevronDown size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Thông báo"
          testID="landlord-overview-notifications"
        >
          <Bell size={20} color={THEME_COLORS.TEXT_PRIMARY} />

          {notificationCount > 0 ? (
            <View style={styles.bellBadge}>
              <Typography
                variant="tiny"
                weight="BOLD"
                color={THEME_COLORS.WHITE}
                style={styles.badgeText}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Typography>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {hasFeatured ? (
          <View style={styles.premiumBanner} testID="landlord-overview-premium-banner">
            <View style={styles.premiumIcon}>
              <Star size={22} color={THEME_COLORS.TEXT_PRIMARY} fill={THEME_COLORS.TEXT_PRIMARY} />
            </View>

            <View style={styles.premiumBody}>
              <Typography variant="body2" weight="BOLD">
                Gói Nổi bật đang hoạt động
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="WARNING">
                Gia hạn để tin tiếp tục lên đầu kết quả
              </Typography>
            </View>

            <TouchableOpacity
              style={styles.renewButton}
              onPress={handleComingSoon}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Gia hạn"
            >
              <Typography variant="body2" weight="BOLD">
                Gia hạn
              </Typography>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Typography variant="h3" weight="BOLD">
            {periodOption.title}
          </Typography>

          <TouchableOpacity
            style={styles.periodPill}
            onPress={() => setIsPeriodVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Khoảng thời gian thống kê: ${periodOption.label}`}
            testID="landlord-overview-period"
          >
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_SECONDARY">
              {periodOption.label}
            </Typography>
            <ChevronDown size={13} color={THEME_COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            testID="landlord-overview-stat-views"
            label="Lượt xem tin"
            value={stats ? formatCount(stats.views) : '–'}
          />
          <StatCard
            testID="landlord-overview-stat-contacts"
            label="Lượt liên hệ"
            value={stats ? formatCount(stats.contacts) : '–'}
          />
          <StatCard
            testID="landlord-overview-stat-bookings"
            label="Yêu cầu xem phòng"
            value={stats ? formatCount(stats.bookings) : '–'}
            note={
              pendingBookings.length > 0 ? `${pendingBookings.length} đang chờ xác nhận` : undefined
            }
            noteColor={OVERLAY_COLORS.EXPIRED_TEXT}
          />
          <StatCard
            testID="landlord-overview-stat-unread"
            label="Tin nhắn chưa đọc"
            value={String(unreadMessages)}
          />
        </View>

        <View style={styles.taskCard} testID="landlord-overview-tasks">
          <Typography variant="body2" weight="BOLD">
            Cần bạn xử lý
          </Typography>
          <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            {taskCount > 0 ? `${notificationCount} việc đang chờ` : 'Không có việc nào đang chờ'}
          </Typography>

          <View style={styles.taskDivider} />

          {pendingBookings.length > 0 ? (
            <TaskRow
              isFirst
              icon={CalendarDays}
              tone="info"
              testID="landlord-overview-task-bookings"
              title={`${pendingBookings.length} yêu cầu xem phòng chờ xác nhận`}
              subtitle={
                soonestExpiry
                  ? `${expiringHours.length} yêu cầu sắp hết hạn sau ${soonestExpiry} giờ`
                  : 'Mở lịch hẹn để xác nhận hoặc từ chối'
              }
              subtitleColor={soonestExpiry ? OVERLAY_COLORS.EXPIRED_TEXT : undefined}
              onPress={() => navigation.navigate('Appointments')}
            />
          ) : null}

          {unreadMessages > 0 ? (
            <TaskRow
              isFirst={pendingBookings.length === 0}
              icon={MessageSquare}
              tone="info"
              testID="landlord-overview-task-messages"
              title={`${unreadMessages} tin nhắn chưa đọc`}
              subtitle="Trả lời sinh viên để không bỏ lỡ khách thuê"
              onPress={() => navigation.navigate('Messages')}
            />
          ) : null}

          {taskCount === 0 ? (
            <View style={styles.emptyTasks}>
              <TrendingUp size={18} color={THEME_COLORS.SUCCESS} />
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Bạn đã xử lý hết mọi việc.
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Typography variant="h3" weight="BOLD">
            Tin đăng của bạn
          </Typography>

          <TouchableOpacity
            onPress={() => navigation.navigate('Listings')}
            accessibilityRole="button"
            accessibilityLabel="Xem tất cả tin đăng"
            testID="landlord-overview-view-all"
          >
            <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
              Xem tất cả
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, styles.chipActive]}
            onPress={() => navigation.navigate('Listings')}
            accessibilityRole="button"
          >
            <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
              {`Đang hiển thị ${counters?.published ?? 0}`}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Listings')}
            accessibilityRole="button"
          >
            <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_SECONDARY">
              {`Chờ duyệt ${counters?.pending ?? 0}`}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Listings')}
            accessibilityRole="button"
          >
            <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_SECONDARY">
              {`Đã ẩn ${counters?.hidden ?? 0}`}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <StatsPeriodSheet
        isVisible={isPeriodVisible}
        value={period}
        onSelect={setPeriod}
        onClose={() => setIsPeriodVisible(false)}
      />

      <LandlordAccountSheet
        isVisible={isAccountVisible}
        fullName={user?.fullName}
        contact={user?.phoneNumber || user?.email}
        avatarUrl={user?.avatarUrl}
        onViewPublicProfile={() =>
          openFromAccount(() =>
            rootNavigation.navigate('LandlordPublicProfile', {
              landlordId: user?.id ?? '',
              isPreview: true,
            })
          )
        }
        onEditProfile={() => openFromAccount(() => rootNavigation.navigate('ProfileEdit'))}
        onChangePassword={() => openFromAccount(() => rootNavigation.navigate('ChangePassword'))}
        onOpenSettings={() => openFromAccount(() => rootNavigation.navigate('Settings'))}
        onLogout={() => openFromAccount(() => setIsLogoutVisible(true))}
        onClose={() => setIsAccountVisible(false)}
      />

      <Modal
        isVisible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        title="Đăng xuất?"
        description="Bạn sẽ cần đăng nhập lại để quản lý tin đăng và lịch hẹn."
        confirmText="Đăng xuất"
        cancelText="Huỷ"
        confirmVariant="danger"
        isConfirmLoading={isLoggingOut}
        onConfirm={() => void handleConfirmLogout()}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  scrollContent: { paddingBottom: SPACING_TOKENS.LG, backgroundColor: THEME_COLORS.BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXS,
    paddingBottom: SPACING_TOKENS.XXS * 2,
    gap: 12,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  accountButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBody: { flex: 1, gap: 2 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleBadge: {
    height: 22,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  roleText: { letterSpacing: 0.5 },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  bellBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: THEME_COLORS.SURFACE,
    backgroundColor: THEME_COLORS.ERROR,
  },
  badgeText: { fontSize: 10, lineHeight: 14 },
  body: { padding: SPACING_TOKENS.MD, gap: 20 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  premiumIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  premiumBody: { flex: 1, gap: 2 },
  renewButton: {
    height: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodPill: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: -8 },
  statCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 104,
    padding: 14,
    gap: 4,
    borderRadius: 14,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  statValue: { fontSize: 24, lineHeight: 32, letterSpacing: -0.4, marginTop: 4 },
  taskCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  taskDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  rowDivider: { height: 1, marginVertical: 12, backgroundColor: THEME_COLORS.DIVIDER },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  taskBody: { flex: 1 },
  emptyTasks: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -8 },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  chipActive: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
});
