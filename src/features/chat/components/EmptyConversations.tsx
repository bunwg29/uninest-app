import { View, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, TYPOGRAPHY_TOKENS } from '@theme';
import { Button, Typography } from '@ui';
import { CHAT_TIPS } from '../types';

export interface EmptyConversationsProps {
  isStudent: boolean;
  onFindRoom: () => void;
}

export const EmptyConversations = ({ isStudent, onFindRoom }: EmptyConversationsProps) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <MessageSquare size={72} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </View>

    <Typography variant="h2" weight="SEMIBOLD" align="center" style={styles.title}>
      Chưa có cuộc trò chuyện nào
    </Typography>

    <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      {isStudent
        ? 'Nhắn tin cho chủ trọ ngay từ trang chi tiết phòng để hỏi giá điện nước, giờ giấc hay hẹn xem phòng.'
        : 'Sinh viên sẽ nhắn tin cho bạn khi quan tâm đến tin đăng. Tin nhắn mới sẽ xuất hiện tại đây.'}
    </Typography>

    {isStudent ? (
      <>
        <Button
          title="Tìm phòng ngay"
          size="lg"
          fullWidth
          textStyle={styles.buttonText}
          onPress={onFindRoom}
        />

        <View style={styles.tipsCard}>
          <Typography
            variant="tiny"
            weight="SEMIBOLD"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.tipsTitle}
          >
            MẸO NHẮN TIN HIỆU QUẢ
          </Typography>

          {CHAT_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.bullet} />

              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.tipText}>
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
    paddingTop: 64,
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
    marginTop: SPACING_TOKENS.LG,
    letterSpacing: -0.3,
  },
  description: {
    marginTop: 10,
    marginBottom: SPACING_TOKENS.LG - 2,
    lineHeight: 22,
  },
  buttonText: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  tipsCard: {
    width: '100%',
    marginTop: SPACING_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.SM,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.CAPTION_SM,
    lineHeight: 15,
    letterSpacing: 0.6,
    paddingBottom: 12,
    marginBottom: SPACING_TOKENS.XS + 2,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
  },
  bullet: {
    width: 5,
    height: 5,
    marginTop: 6,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.SUB,
  },
});
