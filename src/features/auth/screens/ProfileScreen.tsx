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
  Settings,
  Star,
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

  const handleLogout = async () => {
    await logout();

    toast.info('Đã đăng xuất thành công');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  const handleGoToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={profileQuery.isRefetching} onRefresh={profileQuery.refetch} />
      }
    >
      <View style={styles.headerRow}>
        <Typography variant="h2" weight="BOLD">
          Cá nhân
        </Typography>

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Settings size={22} color={THEME_COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
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

          <View style={styles.statsRow}>
            <Stat label="Đã lưu" value={profile.stats.savedRooms} />
            <Stat label="Lịch hẹn" value={profile.stats.appointments} />
            <Stat label="Đánh giá" value={profile.stats.reviews} />
          </View>

          <ProfileSection
            title="HOẠT ĐỘNG"
            items={[
              {
                label: 'Phòng đã lưu',
                icon: Heart,
                tone: ICON_TONES.RED,
                detail: `${profile.stats.savedRooms}`,
              },
              {
                label: 'Lịch hẹn xem phòng',
                icon: CalendarDays,
                tone: ICON_TONES.AMBER,
                detail:
                  profile.stats.appointments > 0
                    ? `${profile.stats.appointments} đang chờ`
                    : undefined,
              },
              { label: 'Danh sách so sánh', icon: Columns2, tone: ICON_TONES.BLUE },
              { label: 'Lịch sử giao dịch', icon: CreditCard, tone: ICON_TONES.GREEN },
              {
                label: 'Đánh giá của tôi',
                icon: Star,
                tone: ICON_TONES.AMBER,
                detail: `${profile.stats.reviews}`,
              },
            ]}
          />
          <ProfileSection
            title="CỘNG ĐỒNG"
            items={[{ label: 'Bài viết & bình luận', icon: MessageSquare, tone: ICON_TONES.SLATE }]}
          />
          <ProfileSection
            title="TÀI KHOẢN"
            items={[{ label: 'Đổi mật khẩu', icon: Settings2, tone: ICON_TONES.SLATE }]}
            onPress={() => navigation.navigate('ChangePassword')}
          />

          <Button
            variant="danger"
            size="md"
            leftIcon={<LogOut size={18} color={THEME_COLORS.SURFACE} />}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Đăng xuất
          </Button>
        </View>
      ) : (
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
  onPress,
}: {
  title: string;
  items: Array<{
    label: string;
    icon: IconComponent;
    tone: (typeof ICON_TONES)[keyof typeof ICON_TONES];
    detail?: string;
  }>;
  onPress?: () => void;
}) => (
  <View style={styles.section}>
    <Typography
      variant="tiny"
      weight="SEMIBOLD"
      color={THEME_COLORS.TEXT_MUTED}
      style={styles.sectionTitle}
    >
      {title}
    </Typography>
    {items.map(({ label, icon: Icon, tone, detail }) => (
      <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLabel}>
          <View style={[styles.menuIconFrame, { backgroundColor: tone.background }]}>
            <Icon size={18} color={tone.foreground} />
          </View>
          <Typography variant="body2" style={styles.menuText}>
            {label}
          </Typography>
        </View>
        {detail ? (
          <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED} style={styles.detailText}>
            {detail}
          </Typography>
        ) : null}
        <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      </TouchableOpacity>
    ))}
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
    marginBottom: SPACING_TOKENS.LG,
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingTop: SPACING_TOKENS.LG,
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
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateContainer: { paddingVertical: SPACING_TOKENS.XL, alignItems: 'center' },
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
    paddingHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: SPACING_TOKENS.SM,
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
  statValue: { lineHeight: 26 },
  statLabel: { marginTop: 2 },
  menuLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuText: { marginLeft: SPACING_TOKENS.SM },
  section: { marginBottom: SPACING_TOKENS.SM },
  sectionTitle: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.SM,
  },
  menuItem: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  menuIconFrame: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  detailText: { marginRight: SPACING_TOKENS.SM },
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
  logoutButton: {
    marginTop: SPACING_TOKENS.MD,
    alignSelf: 'center',
    minWidth: 156,
  },
  notLoggedInText: {
    marginBottom: SPACING_TOKENS.LG,
    textAlign: 'center',
  },
});
