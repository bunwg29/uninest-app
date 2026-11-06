import { Lock, RefreshCw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, SkeletonBox } from '@ui';

export const PremiumSkeleton = () => (
  <View style={styles.skeleton}>
    <SkeletonBox height={96} borderRadius={BORDER_RADIUS_TOKENS.LG} />
    <SkeletonBox height={72} borderRadius={BORDER_RADIUS_TOKENS.LG} />
    <SkeletonBox height={72} borderRadius={BORDER_RADIUS_TOKENS.LG} />
    <SkeletonBox height={72} borderRadius={BORDER_RADIUS_TOKENS.LG} />
  </View>
);

export const PremiumError = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    title="Không thể tải dữ liệu"
    description="Kết nối đang gặp sự cố. Vui lòng kiểm tra mạng và thử lại."
    icon={<RefreshCw size={34} color={THEME_COLORS.ERROR} />}
    actionTitle="Thử lại"
    onAction={onRetry}
  />
);

export const PremiumLocked = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <EmptyState
    title="Dành cho tài khoản Premium"
    description="Nâng cấp Premium để xem lượt xem theo thời gian, nguồn truy cập và tỉ lệ liên hệ."
    icon={<Lock size={34} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
    actionTitle="Nâng cấp Premium"
    onAction={onUpgrade}
  />
);

const styles = StyleSheet.create({
  skeleton: { gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS, padding: SPACING_TOKENS.MD },
});
