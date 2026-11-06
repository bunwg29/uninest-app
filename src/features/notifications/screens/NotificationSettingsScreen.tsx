import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BellOff,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Info,
  Lock,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { useAuthStore } from '@features/auth';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, HeaderBar, NoticeBanner, ScreenContainer, SkeletonBox, Typography } from '@ui';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useNotificationActions, useNotificationPreferences } from '../hooks/useNotifications';
import { usePushPermission } from '../hooks/usePushPermission';
import type { NotificationPreferences } from '../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'NotificationSettings'>;
type PreferenceKey = keyof NotificationPreferences;

const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    variant="tiny"
    weight="SEMIBOLD"
    colorKey="TEXT_PLACEHOLDER"
    style={styles.sectionTitle}
  >
    {children.toUpperCase()}
  </Typography>
);

const Row = ({
  title,
  description,
  right,
  divider,
}: {
  title: string;
  description: string;
  right: ReactNode;
  divider?: boolean;
}) => (
  <>
    {divider ? <View style={styles.divider} /> : null}
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Typography variant="body2" weight="SEMIBOLD">
          {title}
        </Typography>
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {description}
        </Typography>
      </View>
      {right}
    </View>
  </>
);

const CardRow = ({
  icon: Icon,
  title,
  description,
  right,
  divider,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  right: ReactNode;
  divider?: boolean;
}) => (
  <>
    {divider ? <View style={styles.divider} /> : null}
    <View style={styles.cardRow}>
      <View style={styles.cardIcon}>
        <Icon size={18} color={THEME_COLORS.TEXT_MUTED} />
      </View>
      <View style={styles.rowText}>
        <Typography variant="body2" weight="SEMIBOLD">
          {title}
        </Typography>
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {description}
        </Typography>
      </View>
      {right}
    </View>
  </>
);

const AlwaysOn = () => (
  <View style={styles.alwaysOn}>
    <Lock size={13} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
      Luôn bật
    </Typography>
  </View>
);

const PushStatus = () => {
  const state = usePushPermission();

  if (state === 'checking') return null;

  if (state === 'granted') {
    return (
      <NoticeBanner tone="success" icon={CircleCheck} style={styles.banner}>
        Thông báo đẩy đang bật cho thiết bị này.
      </NoticeBanner>
    );
  }

  if (state === 'unsupported') {
    return (
      <NoticeBanner tone="info" icon={Info} style={styles.banner}>
        Thiết bị này không nhận được thông báo đẩy. Bạn vẫn xem thông báo trong ứng dụng.
      </NoticeBanner>
    );
  }

  return (
    <Pressable onPress={() => void Linking.openSettings()} accessibilityRole="button">
      <NoticeBanner tone="warning" icon={BellOff} style={styles.banner}>
        Thông báo đẩy đang tắt. Nhấn để mở cài đặt thiết bị.
      </NoticeBanner>
    </Pressable>
  );
};

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const toast = useToast();
  const role = useAuthStore((state) => state.role);
  const isLandlord = role === 'landlord';
  const query = useNotificationPreferences();
  const { updatePreferences } = useNotificationActions();
  const preferences = query.data;

  const handleChange = async (key: PreferenceKey, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật cài đặt');
    }
  };

  const toggle = (key: PreferenceKey, label: string) =>
    preferences ? (
      <ToggleSwitch
        value={preferences[key]}
        disabled={updatePreferences.isPending}
        label={label}
        onChange={(value) => void handleChange(key, value)}
      />
    ) : null;

  const renderBody = () => {
    if (query.isLoading) {
      return (
        <View style={styles.skeleton} accessibilityLabel="Đang tải cài đặt thông báo">
          {[0, 1, 2, 3, 4].map((index) => (
            <SkeletonBox key={index} height={56} borderRadius={BORDER_RADIUS_TOKENS.MD} />
          ))}
        </View>
      );
    }

    if (query.isError || !preferences) {
      return (
        <EmptyState
          title="Không tải được cài đặt"
          description="Kiểm tra kết nối mạng rồi thử lại."
          actionTitle="Thử lại"
          onAction={() => void query.refetch()}
        />
      );
    }

    if (isLandlord) {
      return (
        <View style={styles.landlordContent}>
          <SectionTitle>Bắt buộc</SectionTitle>
          <View style={styles.card}>
            <CardRow
              icon={CalendarDays}
              title="Yêu cầu xem phòng"
              description="Yêu cầu mới, thay đổi lịch hẹn"
              right={<AlwaysOn />}
            />
            <CardRow
              icon={ShieldCheck}
              title="Kết quả duyệt tin & cảnh báo"
              description="Tin được duyệt, bị từ chối, bị ẩn; cảnh báo từ quản trị viên"
              right={<AlwaysOn />}
              divider
            />
          </View>
          <SectionTitle>Tuỳ chọn</SectionTitle>
          <View style={styles.card}>
            <CardRow
              icon={MessageSquare}
              title="Tin nhắn"
              description="Tin nhắn mới từ sinh viên"
              right={toggle('messages', 'tin nhắn')}
            />
            <CardRow
              icon={CalendarDays}
              title="Nhắc lịch hẹn"
              description="Nhắc 1 giờ trước giờ xem phòng"
              right={toggle('reminders', 'nhắc lịch hẹn')}
              divider
            />
            <CardRow
              icon={Megaphone}
              title="Hệ thống & cộng đồng"
              description="Bình luận bài viết, cập nhật chung"
              right={toggle('system', 'hệ thống và cộng đồng')}
              divider
            />
          </View>
          <NoticeBanner tone="warning" icon={Info}>
            Thông báo đặt lịch, kết quả duyệt tin và cảnh báo từ quản trị viên không thể tắt để bạn
            không bỏ lỡ yêu cầu của sinh viên.
          </NoticeBanner>
        </View>
      );
    }

    return (
      <View>
        <SectionTitle>Lịch hẹn</SectionTitle>
        <View style={styles.group}>
          <Row
            title="Xác nhận lịch hẹn"
            description="Chủ trọ đồng ý hoặc từ chối yêu cầu"
            right={<ToggleSwitch value locked label="Xác nhận lịch hẹn" />}
          />
          <Row
            title="Nhắc trước giờ hẹn"
            description="Nhắc 1 giờ trước khi đi xem phòng"
            right={toggle('reminders', 'nhắc trước giờ hẹn')}
            divider
          />
        </View>
        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.note}
        >
          Hai mục đầu không tắt được vì liên quan trực tiếp tới tiền và cam kết của bạn.
        </Typography>
        <SectionTitle>Tin nhắn</SectionTitle>
        <View style={styles.group}>
          <Row
            title="Tin nhắn mới từ chủ trọ"
            description="Khi bạn không mở ứng dụng"
            right={toggle('messages', 'tin nhắn mới')}
          />
        </View>
        <SectionTitle>Tin đăng & gợi ý</SectionTitle>
        <View style={styles.group}>
          <Row
            title="Phòng mới khớp bộ lọc đã lưu"
            description="Khi có phòng mới đúng tiêu chí bạn lưu"
            right={toggle('newListings', 'phòng mới khớp bộ lọc')}
          />
          <View style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('SavedSearches')}
            accessibilityRole="button"
            accessibilityLabel="Quản lý bộ lọc đã lưu"
          >
            <View style={styles.rowText}>
              <Typography variant="body2" weight="SEMIBOLD">
                Bộ lọc đã lưu
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Bật, tắt hoặc xoá từng bộ lọc
              </Typography>
            </View>
            <ChevronRight size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </Pressable>
        </View>
        <SectionTitle>Cộng đồng & hệ thống</SectionTitle>
        <View style={styles.group}>
          <Row
            title="Bình luận và cập nhật chung"
            description="Bình luận bài viết, thông báo hệ thống"
            right={toggle('system', 'bình luận và cập nhật chung')}
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable keyboardAvoiding={false} style={styles.container}>
      <HeaderBar title="Cài đặt thông báo" alignTitle="left" onBack={() => navigation.goBack()} />
      <PushStatus />
      {renderBody()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: THEME_COLORS.BACKGROUND },
  banner: { marginHorizontal: SPACING_TOKENS.MD, marginTop: SPACING_TOKENS.MD },
  sectionTitle: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.LG,
    paddingBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.6,
  },
  group: { backgroundColor: THEME_COLORS.SURFACE },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD,
    minHeight: 68,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  rowText: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  note: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    letterSpacing: 0.2,
  },
  skeleton: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  landlordContent: { paddingHorizontal: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.LG },
  card: {
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    overflow: 'hidden',
    marginBottom: SPACING_TOKENS.SM,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    minHeight: 64,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alwaysOn: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
});
