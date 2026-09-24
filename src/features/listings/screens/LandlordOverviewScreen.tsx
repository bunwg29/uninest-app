import type { ComponentType } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LucideProps } from 'lucide-react-native';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Badge, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '@features/auth';
import type { LandlordDashboardStat, LandlordDashboardTask } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type IconComponent = ComponentType<LucideProps>;

const DASHBOARD_STATS: LandlordDashboardStat[] = [
  { label: 'Lượt xem tin', value: '1.248', trend: '+18% so với tuần trước', tone: 'positive' },
  { label: 'Lượt liên hệ', value: '36', trend: '+6 lượt', tone: 'positive' },
  { label: 'Yêu cầu xem phòng', value: '9', trend: '-2 so với tuần trước', tone: 'warning' },
  { label: 'Tỉ lệ phản hồi', value: '96%', trend: 'Trung bình ~10 phút', tone: 'positive' },
];

const DASHBOARD_TASKS: LandlordDashboardTask[] = [
  {
    id: 'messages',
    type: 'message',
    title: '1 tin nhắn chưa đọc',
    description: 'Từ bạn Thu Ngân',
  },
  {
    id: 'reviews',
    type: 'review',
    title: '1 đánh giá mới chưa phản hồi',
    description: '4 sao từ bạn Minh Khoa',
  },
];

const TASK_ICONS: Record<LandlordDashboardTask['type'], IconComponent> = {
  message: MessageSquare,
  review: Star,
};

export const LandlordOverviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const displayName = user?.fullName || 'Cô Lệ Hà';
  const initials = displayName
    .split(' ')
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleTaskPress = (task: LandlordDashboardTask) => {
    if (task.type === 'message') {
      navigation.navigate('Main', { screen: 'Messages' });

      return;
    }

    navigation.navigate('LandlordReviews');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
            activeOpacity={0.75}
          >
            <View style={styles.avatar}>
              <Typography variant="body1" weight="BOLD" color={THEME_COLORS.WARNING}>
                {initials}
              </Typography>
            </View>

            <View style={styles.profileCopy}>
              <Typography variant="body1" weight="BOLD">
                {displayName}
              </Typography>
              <View style={styles.roleRow}>
                <Badge label="CHỦ TRỌ" variant="holding" size="sm" />
                <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                  12 phòng
                </Typography>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} accessibilityLabel="Thông báo">
            <Bell size={20} color={THEME_COLORS.TEXT_PRIMARY} />
            <View style={styles.notificationBadge}>
              <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WHITE}>
                4
              </Typography>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('PremiumPlans')}
          activeOpacity={0.85}
        >
          <View style={styles.premiumIcon}>
            <Star size={22} fill={THEME_COLORS.TEXT_PRIMARY} color={THEME_COLORS.TEXT_PRIMARY} />
          </View>
          <View style={styles.premiumCopy}>
            <Typography variant="body1" weight="BOLD">
              Gói Nổi bật còn 3 ngày
            </Typography>
            <Typography variant="caption" color={THEME_COLORS.WARNING}>
              Gia hạn để tin tiếp tục lên đầu kết quả
            </Typography>
          </View>
          <View style={styles.renewButton}>
            <Typography variant="label" weight="BOLD">
              Gia hạn
            </Typography>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Typography variant="h3" weight="BOLD">
            7 ngày qua
          </Typography>
          <TouchableOpacity style={styles.rangeButton}>
            <Typography variant="caption" colorKey="TEXT_SECONDARY">
              7 ngày
            </Typography>
            <ChevronDown size={14} color={THEME_COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {DASHBOARD_STATS.map((stat) => (
            <StatCard
              key={stat.label}
              stat={stat}
              onPress={() => navigation.navigate('LandlordAnalytics')}
            />
          ))}
        </View>

        <View style={styles.tasksCard}>
          <Typography variant="body1" weight="BOLD">
            Cần bạn xử lý
          </Typography>
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.taskCount}>
            {DASHBOARD_TASKS.length} việc đang chờ
          </Typography>

          <View style={styles.divider} />
          {DASHBOARD_TASKS.length > 0 ? (
            DASHBOARD_TASKS.map((task, index) => {
              const Icon = TASK_ICONS[task.type];
              const isReview = task.type === 'review';

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskRow, index < DASHBOARD_TASKS.length - 1 && styles.taskDivider]}
                  onPress={() => handleTaskPress(task)}
                >
                  <View style={[styles.taskIcon, isReview && styles.reviewIcon]}>
                    <Icon
                      size={18}
                      color={isReview ? THEME_COLORS.WARNING : THEME_COLORS.PRIMARY}
                    />
                  </View>
                  <View style={styles.taskCopy}>
                    <Typography variant="label" weight="BOLD" numberOfLines={1}>
                      {task.title}
                    </Typography>
                    <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                      {task.description}
                    </Typography>
                  </View>
                  <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Typography variant="body2" colorKey="TEXT_PLACEHOLDER" style={styles.emptyTasks}>
              Hiện không có việc cần xử lý
            </Typography>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ stat, onPress }: { stat: LandlordDashboardStat; onPress: () => void }) => {
  const TrendIcon = stat.tone === 'positive' ? TrendingUp : TrendingDown;
  const color = stat.tone === 'positive' ? THEME_COLORS.SUCCESS : THEME_COLORS.WARNING;

  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
        {stat.label}
      </Typography>
      <Typography variant="h1" weight="BOLD" style={styles.statValue}>
        {stat.value}
      </Typography>
      <View style={styles.trendRow}>
        <TrendIcon size={13} color={color} />
        <Typography variant="tiny" weight="BOLD" color={color} style={styles.trendText}>
          {stat.trend}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  content: { backgroundColor: THEME_COLORS.BACKGROUND, paddingBottom: SPACING_TOKENS.XL },
  profileHeader: {
    minHeight: 64,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  profileButton: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0C7',
  },
  profileCopy: { marginLeft: 12, flex: 1 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.SURFACE,
  },
  premiumBanner: {
    margin: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.LG,
    minHeight: 86,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0D9A0',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCopy: { flex: 1, marginHorizontal: 12 },
  renewButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  sectionHeader: {
    paddingHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: '#C9CFDA',
    backgroundColor: THEME_COLORS.SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: SPACING_TOKENS.MD,
    marginTop: 12,
  },
  statCard: {
    width: '48%',
    minHeight: 104,
    padding: 14,
    borderRadius: 14,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  statValue: { marginTop: 2, lineHeight: 32 },
  trendRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  trendText: { flex: 1, marginLeft: 3 },
  tasksCard: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: 20,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  taskCount: { marginTop: 2 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER, marginTop: 14 },
  taskRow: { minHeight: 63, flexDirection: 'row', alignItems: 'center' },
  taskDivider: { borderBottomWidth: 1, borderBottomColor: THEME_COLORS.DIVIDER },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  reviewIcon: { backgroundColor: THEME_COLORS.WARNING_LIGHT },
  taskCopy: { flex: 1, marginHorizontal: 12 },
  emptyTasks: { paddingVertical: SPACING_TOKENS.LG, textAlign: 'center' },
});
