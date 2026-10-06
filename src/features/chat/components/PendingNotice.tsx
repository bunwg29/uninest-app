import { View, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface PendingNoticeProps {
  count: number;
}

export const PendingNotice = ({ count }: PendingNoticeProps) => (
  <View style={styles.container}>
    <Info size={16} color={THEME_COLORS.PRIMARY} />

    <Typography variant="body2" colorKey="PRIMARY_DARK" style={styles.text}>
      {`${count} tin nhắn đang chờ. Nội dung đã lưu trên máy, không bị mất.`}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
    marginHorizontal: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  text: {
    flex: 1,
  },
});
