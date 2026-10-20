import { View, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Typography } from '@ui';

export interface PendingNoticeProps {
  count: number;
}

export const PendingNotice = ({ count }: PendingNoticeProps) => (
  <View style={styles.container}>
    <Info size={17} color={THEME_COLORS.PRIMARY_DARK} />

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
    marginTop: SPACING_TOKENS.SM + 2,
    paddingTop: 11,
    paddingBottom: 13,
    paddingHorizontal: 13,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  text: {
    flex: 1,
    fontSize: 13,
  },
});
