import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  Pencil,
  TrendingUp,
  XCircle,
} from 'lucide-react-native';
import { Badge, Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'LandlordListingDetail'>;

export const LandlordListingDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { listing } = route.params;
  const isRejected = listing.status === 'rejected';

  const handleEdit = () => {
    navigation.navigate('ListingPost', {
      screen: 'ListingPostBasicInfo',
      params: { listing },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Quay lại">
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          {isRejected ? 'Tin bị từ chối' : 'Quản lý tin đăng'}
        </Typography>
        <EllipsisVertical size={21} color={THEME_COLORS.TEXT_PRIMARY} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isRejected ? (
          <View style={styles.errorBanner}>
            <XCircle size={19} color={THEME_COLORS.ERROR} />
            <Typography variant="body2" colorKey="ERROR" style={styles.bannerText}>
              <Typography variant="body2" weight="BOLD" colorKey="ERROR">
                Tin chưa được duyệt.{' '}
              </Typography>
              Sửa theo góp ý bên dưới rồi gửi lại, tin không bị xoá và không phải nhập lại từ đầu.
            </Typography>
          </View>
        ) : null}

        <View style={styles.listingCard}>
          <View style={styles.thumbnail} />
          <View style={styles.listingCopy}>
            <View style={styles.badges}>
              <Badge
                label={isRejected ? 'BỊ TỪ CHỐI' : 'ĐANG HIỂN THỊ'}
                variant={isRejected ? 'danger' : 'available'}
                size="sm"
              />
              {listing.isFeatured ? <Badge label="NỔI BẬT" variant="featured" size="sm" /> : null}
            </View>
            <Typography variant="body1" weight="BOLD" numberOfLines={2}>
              {listing.title}
            </Typography>
            {isRejected ? (
              <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" style={styles.listingMeta}>
                #{listing.id} · gửi duyệt 06/09/2026
              </Typography>
            ) : (
              <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
                {listing.price.toLocaleString('vi-VN')}đ
                <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                  {' '}
                  /tháng · {listing.area} m²
                </Typography>
              </Typography>
            )}
          </View>
        </View>

        {isRejected ? <RejectionDetails reason={listing.rejectionReason} /> : <PublishedDetails />}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={isRejected ? 'Xoá tin' : 'Đánh dấu đã cho thuê'}
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.secondaryButton}
        />
        <Button
          title={isRejected ? 'Sửa và gửi lại' : 'Chỉnh sửa'}
          onPress={handleEdit}
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
};

const RejectionDetails = ({ reason }: { reason?: string }) => (
  <View style={styles.detailCard}>
    <View style={styles.detailCardHeader}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
        LÝ DO TỪ CHỐI
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        06/09 · 14:20
      </Typography>
    </View>
    <Reason
      title="Ảnh trùng với tin đăng khác"
      description="Ảnh số 1 và số 3 khớp với một tin đăng của tài khoản khác."
    />
    <Reason
      title="Có số điện thoại trong mô tả"
      description="Sinh viên liên hệ qua nhắn tin trong ứng dụng."
    />
    <View style={styles.adminNote}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
        GHI CHÚ TỪ QUẢN TRỊ VIÊN
      </Typography>
      <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.noteText}>
        {reason || 'Vui lòng cập nhật ảnh thực tế và bỏ số điện thoại khỏi phần mô tả.'}
      </Typography>
    </View>
  </View>
);

const Reason = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.reasonRow}>
    <View style={styles.reasonIcon}>
      <XCircle size={17} color={THEME_COLORS.ERROR} />
    </View>
    <View style={styles.reasonCopy}>
      <Typography variant="body2" weight="BOLD">
        {title}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.reasonDescription}>
        {description}
      </Typography>
    </View>
  </View>
);

const PublishedDetails = () => (
  <>
    <View style={styles.visibilityCard}>
      <View>
        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
          Trạng thái hiển thị
        </Typography>
        <Typography variant="body2" weight="BOLD" colorKey="SUCCESS" style={styles.visibilityValue}>
          Đang hiện với sinh viên
        </Typography>
      </View>
      <Button title="Ẩn tin" variant="outline" size="sm" onPress={() => undefined} />
    </View>

    <View style={styles.detailCard}>
      <View style={styles.detailCardHeader}>
        <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
          7 NGÀY QUA
        </Typography>
        <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
          Xem đầy đủ
        </Typography>
      </View>
      <View style={styles.quickStats}>
        {[
          ['1.842', 'Lượt xem'],
          ['62', 'Đã lưu'],
          ['14', 'Liên hệ'],
          ['5', 'Đặt lịch'],
        ].map(([value, label]) => (
          <View key={label} style={styles.quickStat}>
            <Typography variant="body1" weight="BOLD">
              {value}
            </Typography>
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
              {label}
            </Typography>
          </View>
        ))}
      </View>
      <View style={styles.performanceBanner}>
        <TrendingUp size={17} color={THEME_COLORS.SUCCESS} />
        <Typography variant="caption" colorKey="SUCCESS" style={styles.bannerText}>
          Tin này đang hiệu quả nhất trong 6 tin của bạn.
        </Typography>
      </View>
    </View>

    <View style={styles.detailCard}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
        THAO TÁC NHANH
      </Typography>
      <QuickAction icon={Pencil} title="Chỉnh sửa tin đăng" />
      <QuickAction
        icon={CalendarDays}
        title="Khung giờ cho xem phòng"
        detail="Đang bật 15 khung / tuần"
      />
      <QuickAction icon={Eye} title="Xem tin như sinh viên" />
    </View>
  </>
);

const QuickAction = ({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Pencil;
  title: string;
  detail?: string;
}) => (
  <TouchableOpacity style={styles.quickAction}>
    <View style={styles.quickIcon}>
      <Icon size={18} color={THEME_COLORS.PRIMARY} />
    </View>
    <View style={styles.quickCopy}>
      <Typography variant="body2" weight="BOLD">
        {title}
      </Typography>
      {detail ? (
        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
          {detail}
        </Typography>
      ) : null}
    </View>
    <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
  </TouchableOpacity>
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
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: 100,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    marginBottom: 14,
  },
  bannerText: { flex: 1, marginLeft: 9 },
  listingCard: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    elevation: 2,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: '#D4DBE6',
  },
  listingCopy: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  listingMeta: { marginTop: 5 },
  detailCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    elevation: 1,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  reasonRow: { flexDirection: 'row', paddingVertical: 12 },
  reasonIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCopy: { flex: 1, marginLeft: 10 },
  reasonDescription: { marginTop: 4 },
  adminNote: {
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.ERROR,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  noteText: { marginTop: 6 },
  visibilityCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityValue: { marginTop: 4 },
  quickStats: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderRadius: 10,
  },
  quickStat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  performanceBanner: {
    flexDirection: 'row',
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7E9CE',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  quickAction: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: { flex: 1, marginLeft: 12 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING_TOKENS.MD,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  secondaryButton: { flex: 1 },
  primaryButton: { flex: 1.45 },
});
