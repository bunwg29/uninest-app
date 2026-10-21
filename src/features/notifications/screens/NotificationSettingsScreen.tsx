import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell } from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useNotificationActions, useNotificationPreferences } from '../hooks/useNotifications';
import type { NotificationPreferences } from '../types';

const SETTINGS: Array<{ key: keyof NotificationPreferences; label: string; description: string }> =
  [
    {
      key: 'newListings',
      label: 'Tin đăng mới',
      description: 'Phòng trọ phù hợp với bộ lọc bạn đã lưu',
    },
    { key: 'messages', label: 'Tin nhắn', description: 'Tin nhắn mới từ sinh viên hoặc chủ trọ' },
    { key: 'reminders', label: 'Nhắc lịch', description: 'Nhắc trước giờ xem phòng' },
    {
      key: 'system',
      label: 'Hệ thống và cộng đồng',
      description: 'Cập nhật chung và bình luận bài viết',
    },
  ];

export const NotificationSettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'NotificationSettings'>>();
  const toast = useToast();
  const query = useNotificationPreferences();
  const { updatePreferences } = useNotificationActions();

  const handleChange = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật cài đặt');
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <HeaderBar title="Cài đặt thông báo" onBack={() => navigation.goBack()} />
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      ) : query.isError || !query.data ? (
        <View style={styles.center}>
          <EmptyState title="Không tải được cài đặt" description="Vui lòng thử lại sau." />
          <Button title="Thử lại" onPress={() => void query.refetch()} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.intro}>
            <Bell size={22} color={THEME_COLORS.PRIMARY} />
            <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.introText}>
              Chọn thông báo bạn muốn nhận. Thông báo về giao dịch và đặt lịch luôn được giữ để bạn
              không bỏ lỡ cập nhật quan trọng.
            </Typography>
          </View>
          <Button
            title="Quản lý bộ lọc đã lưu"
            variant="outline"
            onPress={() => navigation.navigate('SavedSearches')}
          />
          {SETTINGS.map((item) => (
            <View key={item.key} style={styles.row}>
              <View style={styles.rowText}>
                <Typography variant="body2" weight="SEMIBOLD">
                  {item.label}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  {item.description}
                </Typography>
              </View>
              <Switch
                value={query.data[item.key]}
                onValueChange={(value) => void handleChange(item.key, value)}
                disabled={updatePreferences.isPending}
                trackColor={{ true: THEME_COLORS.PRIMARY_LIGHT }}
                thumbColor={
                  query.data[item.key] ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER
                }
                accessibilityLabel={`Nhận thông báo ${item.label}`}
              />
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: THEME_COLORS.BACKGROUND },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING_TOKENS.LG },
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD },
  intro: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  introText: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    minHeight: 76,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  rowText: { flex: 1, gap: SPACING_TOKENS.XS },
});
