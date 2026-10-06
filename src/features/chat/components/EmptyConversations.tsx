import { View, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography } from '@ui';
import { CHAT_TIPS } from '../types';

export interface EmptyConversationsProps {
  isStudent: boolean;
  onFindRoom: () => void;
}

export const EmptyConversations = ({ isStudent, onFindRoom }: EmptyConversationsProps) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <MessageSquare size={44} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </View>

    <Typography variant="h2" weight="BOLD" align="center" style={styles.title}>
      Chưa có cuộc trò chuyện nào
    </Typography>

    <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      {isStudent
        ? 'Nhắn tin cho chủ trọ ngay từ trang chi tiết phòng để hỏi giá điện nước, giờ giấc hay hẹn xem phòng.'
        : 'Sinh viên sẽ nhắn tin cho bạn khi quan tâm đến tin đăng. Tin nhắn mới sẽ xuất hiện tại đây.'}
    </Typography>

    {isStudent ? (
      <>
        <Button title="Tìm phòng ngay" size="lg" fullWidth onPress={onFindRoom} />

        <View style={styles.tipsCard}>
          <Typography
            variant="tiny"
            weight="SEMIBOLD"
            colorKey="TEXT_MUTED"
            style={styles.tipsTitle}
          >
            MẸO NHẮN TIN HIỆU QUẢ
          </Typography>

          {CHAT_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.bullet} />

              <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.tipText}>
                {tip}
              </Typography>
            </View>
          ))}
        </View>
      </>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXL,
    gap: SPACING_TOKENS.MD,
  },
  iconCircle: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  title: {
    marginTop: SPACING_TOKENS.SM,
  },
  description: {
    marginBottom: SPACING_TOKENS.SM,
  },
  tipsCard: {
    width: '100%',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.SM + 4,
  },
  tipsTitle: {
    letterSpacing: 0.6,
    paddingBottom: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
  },
  bullet: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  tipText: {
    flex: 1,
  },
});
