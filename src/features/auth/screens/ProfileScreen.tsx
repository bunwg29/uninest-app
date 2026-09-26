import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Heart,
  MessageSquare,
  ChevronRight,
  Columns2,
  Edit3,
  LogOut,
  Settings2,
  Star,
  Home,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Avatar, Button, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '../hooks';
import { authService } from '../services';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type IconComponent = typeof Heart;

const ICON_TONES = {
  RED: { foreground: '#D21F2B', background: '#FFF0F1' },
  BLUE: { foreground: THEME_COLORS.PRIMARY, background: THEME_COLORS.PRIMARY_LIGHT },
  AMBER: { foreground: THEME_COLORS.SECONDARY, background: THEME_COLORS.WARNING_LIGHT },
  GREEN: { foreground: THEME_COLORS.SUCCESS, background: THEME_COLORS.SUCCESS_LIGHT },
  SLATE: { foreground: THEME_COLORS.TEXT_MUTED, background: THEME_COLORS.SURFACE_MUTED },
} as const;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
  });

  const profile = profileQuery.data;
  const isLandlord = user?.role === 'landlord';

  const handleLogout = async () => {
    await logout();

    toast.info('Đã đăng xuất thành công');
  };

  const handleGoToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <ScreenContainer
      scrollable
      applyBottomInset={false}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={profileQuery.isRefetching} onRefresh={profileQuery.refetch} />
      }
    >
      <View style={styles.headerRow}>
        <Typography variant="h2" weight="BOLD">
          {isLandlord ? 'Hồ sơ chủ trọ' : 'Cá nhân'}
        </Typography>

        <View style={styles.headerSpacer} />
      </View>

      {isAuthenticated && profileQuery.isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
        </View>
      ) : isAuthenticated && profileQuery.isError ? (
        <View style={styles.card}>
          <Typography
            variant="body1"
            color={THEME_COLORS.TEXT_MUTED}
            style={styles.notLoggedInText}
          >
            Không thể tải hồ sơ. Vui lòng thử lại.
          </Typography>
          <Button variant="outline" size="md" fullWidth onPress={() => profileQuery.refetch()}>
            Thử lại
          </Button>
        </View>
      ) : isAuthenticated && user && profile ? (
        <View>
          <View style={styles.userHeader}>
            <Avatar uri={profile.avatarUrl} name={profile.name} size="lg" />

            <View style={styles.userInfo}>
              <Typography variant="h3" weight="SEMIBOLD" color={THEME_COLORS.TEXT_PRIMARY}>
                {profile.name}
              </Typography>

              <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED} style={styles.phoneText}>
                {profile.role.toLowerCase() === 'student'
                  ? `Sinh viên · ${profile.school || 'Chưa cập nhật trường'}`
                  : profile.school || 'Chủ trọ'}
              </Typography>

              <View style={styles.badgeRow}>
                {profile.phoneVerified ? (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={14} color={THEME_COLORS.SUCCESS} />
                    <Typography variant="tiny" weight="SEMIBOLD" color={THEME_COLORS.SUCCESS}>
                      ĐÃ XÁC MINH SĐT
                    </Typography>
                  </View>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileEdit')}
              disabled={!profile}
              style={styles.iconButton}
            >
              <Edit3 size={20} color={THEME_COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          {!isLandlord ? (
            <View style={styles.statsRow}>
              <Stat label="Đã lưu" value={profile.stats.savedRooms} />
              <Stat label="Lịch hẹn" value={profile.stats.appointments} />
              <Stat label="Đánh giá" value={profile.stats.reviews} />
            </View>
          ) : null}

          <ProfileSection
            title={isLandlord ? 'QUẢN LÝ CHỦ TRỌ' : 'HOẠT ĐỘNG'}
            items={
              isLandlord
                ? [
                    {
                      label: 'Tin đăng của tôi',
                      icon: Home,
                      tone: ICON_TONES.BLUE,
                      onPress: () => navigation.navigate('Main', { screen: 'Listings' }),
                    },
                    {
                      label: 'Yêu cầu xem phòng',
                      icon: CalendarDays,
                      tone: ICON_TONES.AMBER,
                      onPress: () => navigation.navigate('Main', { screen: 'Appointments' }),
                    },
                  ]
                : [
                    {
                      label: 'Phòng đã lưu',
                      icon: Heart,
                      tone: ICON_TONES.RED,
                      detail: `${profile.stats.savedRooms}`,
                      onPress: () => toast.info('Tính năng danh sách phòng đã lưu đang phát triển'),
                    },
                    {
                      label: 'Lịch hẹn xem phòng',
                      icon: CalendarDays,
                      tone: ICON_TONES.AMBER,
                      detail:
                        profile.stats.appointments > 0
                          ? `${profile.stats.appointments} đang chờ`
                          : undefined,
                      onPress: () => toast.info('Tính năng lịch hẹn xem phòng đang phát triển'),
                    },
                    {
                      label: 'Danh sách so sánh',
                      icon: Columns2,
                      tone: ICON_TONES.BLUE,
                      onPress: () => toast.info('Tính năng so sánh phòng đang phát triển'),
                    },
                    {
                      label: 'Lịch sử giao dịch',
                      icon: CreditCard,
                      tone: ICON_TONES.GREEN,
                      onPress: () => toast.info('Tính năng lịch sử giao dịch đang phát triển'),
                    },
                    {
                      label: 'Đánh giá của tôi',
                      icon: Star,
                      tone: ICON_TONES.AMBER,
                      detail: `${profile.stats.reviews}`,
                      onPress: () => toast.info('Tính năng đánh giá đang phát triển'),
                    },
                  ]
            }
          />

          {!isLandlord ? (
            <ProfileSection
              title="CỘNG ĐỒNG"
              items={[
                {
                  label: 'Bài viết & bình luận',
                  icon: MessageSquare,
                  tone: ICON_TONES.SLATE,
                  onPress: () => toast.info('Tính năng cộng đồng đang phát triển'),
                },
              ]}
            />
          ) : null}

          <ProfileSection
            title="TÀI KHOẢN & HỆ THỐNG"
            items={[
              {
                label: 'Chỉnh sửa thông tin cá nhân',
                icon: Edit3,
                tone: ICON_TONES.BLUE,
                onPress: () => navigation.navigate('ProfileEdit'),
              },
              {
                label: 'Đổi mật khẩu',
                icon: Settings2,
                tone: ICON_TONES.SLATE,
                onPress: () => navigation.navigate('ChangePassword'),
              },
              {
                label: 'Cài đặt ứng dụng',
                icon: Settings2,
                tone: ICON_TONES.SLATE,
                onPress: () => navigation.navigate('Settings'),
              },
            ]}
          />

          <View style={styles.logoutWrapper}>
            <TouchableOpacity
              style={styles.customLogoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={20} color={THEME_COLORS.ERROR} style={styles.logoutIcon} />
              <Typography variant="body1" weight="SEMIBOLD" color={THEME_COLORS.ERROR}>
                Đăng xuất
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.notLoggedInContainer}>
          <View style={styles.card}>
            <Typography
              variant="body1"
              color={THEME_COLORS.TEXT_MUTED}
              style={styles.notLoggedInText}
            >
              Đăng nhập để xem thông tin tài khoản và quản lý hợp đồng
            </Typography>

            <Button variant="primary" size="lg" fullWidth onPress={handleGoToLogin}>
              Đăng nhập
            </Button>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Typography variant="h2" weight="BOLD" style={styles.statValue}>
      {value}
    </Typography>
    <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED} style={styles.statLabel}>
      {label}
    </Typography>
  </View>
);

const ProfileSection = ({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    icon: IconComponent;
    tone: (typeof ICON_TONES)[keyof typeof ICON_TONES];
    detail?: string;
    onPress?: () => void;
  }>;
}) => (
  <View style={styles.section}>
    <Typography
      variant="tiny"
      weight="BOLD"
      color={THEME_COLORS.TEXT_MUTED}
      style={styles.sectionTitle}
    >
      {title}
    </Typography>

    <View style={styles.sectionCard}>
      {items.map(({ label, icon: Icon, tone, detail, onPress }, index) => (
        <TouchableOpacity
          key={label}
          style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuLabel}>
            <View style={[styles.menuIconFrame, { backgroundColor: tone.background }]}>
              <Icon size={18} color={tone.foreground} />
            </View>
            <Typography variant="body2" weight="MEDIUM" style={styles.menuText}>
              {label}
            </Typography>
          </View>

          <View style={styles.menuRight}>
            {detail ? (
              <Typography
                variant="caption"
                color={THEME_COLORS.TEXT_MUTED}
                style={styles.detailText}
              >
                {detail}
              </Typography>
            ) : null}
            <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING_TOKENS.SM,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingTop: SPACING_TOKENS.SM,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  stateContainer: {
    paddingVertical: SPACING_TOKENS.XL,
    alignItems: 'center',
  },
  notLoggedInContainer: {
    paddingHorizontal: SPACING_TOKENS.LG,
    marginTop: SPACING_TOKENS.MD,
  },
  card: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    padding: SPACING_TOKENS.LG,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.LG,
    paddingHorizontal: SPACING_TOKENS.LG,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    marginBottom: SPACING_TOKENS.LG,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME_COLORS.BORDER,
    paddingHorizontal: SPACING_TOKENS.XS,
  },
  statValue: {
    lineHeight: 26,
  },
  statLabel: {
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING_TOKENS.MD,
  },
  sectionTitle: {
    marginHorizontal: SPACING_TOKENS.LG,
    marginBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    marginLeft: SPACING_TOKENS.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  menuIconFrame: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginRight: SPACING_TOKENS.SM,
  },
  userInfo: {
    marginLeft: SPACING_TOKENS.MD,
    flex: 1,
  },
  phoneText: {
    marginVertical: 2,
  },
  badgeRow: {
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    borderWidth: 1,
    borderColor: THEME_COLORS.SUCCESS,
  },
  logoutWrapper: {
    marginHorizontal: SPACING_TOKENS.LG,
    marginTop: SPACING_TOKENS.MD,
    marginBottom: 48,
  },
  customLogoutButton: {
    height: 52,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: SPACING_TOKENS.SM,
  },
  notLoggedInText: {
    marginBottom: SPACING_TOKENS.LG,
    textAlign: 'center',
  },
});
