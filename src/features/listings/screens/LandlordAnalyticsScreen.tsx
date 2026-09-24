import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronDown,
  ChevronLeft,
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CHART_POINTS = [38, 52, 43, 68, 74, 66, 92];

export const LandlordAnalyticsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Thống kê tin đăng
        </Typography>
        <TouchableOpacity style={styles.rangeButton}>
          <Typography variant="caption" colorKey="TEXT_SECONDARY">
            7 ngày
          </Typography>
          <ChevronDown size={14} color={THEME_COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            Tổng lượt xem
          </Typography>
          <View style={styles.heroValueRow}>
            <Typography variant="h1" weight="BOLD">
              1.248
            </Typography>
            <View style={styles.growthBadge}>
              <TrendingUp size={14} color={THEME_COLORS.SUCCESS} />
              <Typography variant="caption" weight="BOLD" colorKey="SUCCESS">
                18%
              </Typography>
            </View>
          </View>
          <View style={styles.chart}>
            {CHART_POINTS.map((point, index) => (
              <View key={`${point}-${index}`} style={styles.barColumn}>
                <View style={[styles.bar, { height: point }]} />
                <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric icon={MessageCircle} value="36" label="Liên hệ" />
          <Metric icon={Eye} value="9" label="Đặt lịch" />
          <Metric icon={Star} value="62" label="Lưu tin" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Typography variant="body1" weight="BOLD">
              Hiệu quả từng tin
            </Typography>
            <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
              Xem tất cả
            </Typography>
          </View>
          <PerformanceRow
            title="Phòng mới xây có gác lửng"
            detail="1.842 lượt xem · 14 liên hệ"
            tone="#C9D9FF"
          />
          <PerformanceRow
            title="Phòng tầng 3 có ban công"
            detail="1.106 lượt xem · 9 liên hệ"
            tone="#FFE2A0"
          />
          <PerformanceRow
            title="Phòng khép kín tầng 2"
            detail="864 lượt xem · 5 liên hệ"
            tone="#C9F3E2"
          />
        </View>

        <View style={styles.tipCard}>
          <Star size={18} color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.tipText}>
            Tin có từ 6 ảnh trở lên nhận trung bình nhiều hơn 40% lượt liên hệ. Hai tin của bạn đang
            có dưới 5 ảnh.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Metric = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: string;
  label: string;
}) => (
  <View style={styles.metric}>
    <Icon size={18} color={THEME_COLORS.PRIMARY} />
    <Typography variant="h3" weight="BOLD" style={styles.metricValue}>
      {value}
    </Typography>
    <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
      {label}
    </Typography>
  </View>
);

const PerformanceRow = ({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: string;
}) => (
  <View style={styles.performanceRow}>
    <View style={[styles.thumbnail, { backgroundColor: tone }]} />
    <View style={styles.performanceCopy}>
      <Typography variant="body2" weight="BOLD" numberOfLines={1}>
        {title}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
        {detail}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    height: 58,
    paddingHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  headerTitle: { flex: 1, marginLeft: 18 },
  rangeButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: '#C9CFDA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  heroCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  growthBadge: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  chart: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    marginTop: 14,
    paddingTop: 10,
  },
  barColumn: { flex: 1, alignItems: 'center', gap: 5 },
  bar: {
    width: '72%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  metricsRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  metric: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  metricValue: { marginTop: 4 },
  card: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  thumbnail: { width: 44, height: 44, borderRadius: 10 },
  performanceCopy: { flex: 1, marginLeft: 12 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginTop: 12,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  tipText: { flex: 1, marginLeft: 10 },
});
