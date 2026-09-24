import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BadgeCheck, ChevronLeft, Home, MapPin, MessageSquare, Star } from 'lucide-react-native';
import { Badge, Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '../hooks/useAuth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LandlordPublicProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const displayName = user?.fullName || 'Cô Lệ Hà';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Hồ sơ chủ trọ
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Typography variant="h1" weight="BOLD" color={THEME_COLORS.WARNING}>
              LH
            </Typography>
          </View>
          <View style={styles.nameRow}>
            <Typography variant="h2" weight="BOLD">
              {displayName}
            </Typography>
            <BadgeCheck size={19} fill={THEME_COLORS.PRIMARY} color={THEME_COLORS.WHITE} />
          </View>
          <Badge label="CHỦ TRỌ ĐÃ XÁC MINH" variant="holding" />
          <View style={styles.locationRow}>
            <MapPin size={15} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.locationText}>
              Liên Chiểu, Đà Nẵng
            </Typography>
          </View>
        </View>

        <View style={styles.statsCard}>
          <ProfileStat value="12" label="Phòng quản lý" />
          <ProfileStat value="4,8" label="Điểm đánh giá" />
          <ProfileStat value="96%" label="Phản hồi" />
        </View>

        <View style={styles.card}>
          <Typography variant="body1" weight="BOLD">
            Giới thiệu
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.description}>
            Cô cho thuê phòng trọ sinh viên tại khu vực gần Đại học Bách khoa hơn 6 năm. Thông tin
            và chi phí luôn được trao đổi rõ ràng trước khi nhận phòng.
          </Typography>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Typography variant="body1" weight="BOLD">
              Phòng đang cho thuê
            </Typography>
            <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
              Xem tất cả
            </Typography>
          </View>
          {['Phòng mới xây có gác lửng, cửa sổ lớn', 'Phòng khép kín tầng 2, ban công phơi đồ'].map(
            (title, index) => (
              <View key={title} style={styles.roomRow}>
                <View style={[styles.roomImage, index === 1 && styles.roomImageGreen]} />
                <View style={styles.roomCopy}>
                  <Typography variant="body2" weight="BOLD" numberOfLines={2}>
                    {title}
                  </Typography>
                  <Typography variant="caption" colorKey="PRIMARY_DARK">
                    {index === 0 ? '2.500.000đ' : '2.200.000đ'} / tháng
                  </Typography>
                </View>
              </View>
            )
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.reviewHeader}>
            <Star size={20} fill={THEME_COLORS.SECONDARY} color={THEME_COLORS.SECONDARY} />
            <Typography variant="body1" weight="BOLD" style={styles.reviewTitle}>
              4,8 · 24 đánh giá
            </Typography>
          </View>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            “Cô chủ phản hồi nhanh, phòng sạch và đúng như ảnh.”
          </Typography>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Xem tin đăng"
          variant="outline"
          leftIcon={<Home size={18} color={THEME_COLORS.TEXT_PRIMARY} />}
          onPress={() => navigation.navigate('Main', { screen: 'Listings' })}
          style={styles.actionButton}
        />
        <Button
          title="Nhắn tin"
          leftIcon={<MessageSquare size={18} color={THEME_COLORS.WHITE} />}
          onPress={() => navigation.navigate('Main', { screen: 'Messages' })}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const ProfileStat = ({ value, label }: { value: string; label: string }) => (
  <View style={styles.stat}>
    <Typography variant="h3" weight="BOLD">
      {value}
    </Typography>
    <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" align="center">
      {label}
    </Typography>
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
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 24 },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: 100,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  profileHero: { alignItems: 'center', paddingVertical: SPACING_TOKENS.LG },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0C7',
    marginBottom: 12,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { marginLeft: 4 },
  statsCard: {
    paddingVertical: SPACING_TOKENS.MD,
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME_COLORS.BORDER,
  },
  card: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 12,
  },
  description: { marginTop: 8 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  roomImage: { width: 58, height: 58, borderRadius: 10, backgroundColor: '#C9D9FF' },
  roomImageGreen: { backgroundColor: '#C9F3E2' },
  roomCopy: { flex: 1, marginLeft: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewTitle: { marginLeft: 8 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING_TOKENS.MD,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  actionButton: { flex: 1 },
});
