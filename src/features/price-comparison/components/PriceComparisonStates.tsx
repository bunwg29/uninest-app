import { BarChart3, RefreshCw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, SkeletonBox, Typography } from '@ui';

export const PriceComparisonSkeleton = () => (
  <View style={styles.skeletonCard}>
    <SkeletonBox height={120} borderRadius={BORDER_RADIUS_TOKENS.MD} />
    <SkeletonBox width="70%" height={22} />
    <SkeletonBox width="100%" height={16} />
    <SkeletonBox width="82%" height={16} />
  </View>
);

export const PriceComparisonPrompt = () => (
  <EmptyState
    title="Chọn khu vực để tham khảo"
    description="Chọn tỉnh/thành, phường/xã và loại phòng để xem mặt bằng giá thuê."
    icon={<BarChart3 size={34} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
  />
);

export const PriceComparisonError = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    title="Không thể tải dữ liệu giá"
    description="Kết nối đang gặp sự cố. Vui lòng kiểm tra mạng và thử lại."
    icon={<RefreshCw size={34} color={THEME_COLORS.ERROR} />}
    actionTitle="Thử lại"
    onAction={onRetry}
  />
);

export const InsufficientPriceData = ({ sampleCount }: { sampleCount: number }) => (
  <View style={styles.insufficientCard}>
    <View style={styles.chartPlaceholder}>
      <BarChart3 size={30} color={OVERLAY_COLORS.STEP_PENDING_TEXT} />
      <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
        Chưa có biểu đồ
      </Typography>
    </View>
    <Typography variant="h4" weight="SEMIBOLD" colorKey="WARNING" align="center">
      Dữ liệu chưa đủ để tham chiếu
    </Typography>
    <Typography variant="caption" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      {sampleCount === 0
        ? 'Khu vực này chưa có tin hợp lệ. Hãy thử khu vực hoặc loại phòng khác.'
        : `Khu vực này mới có ${sampleCount} tin hợp lệ (cần tối thiểu 5 tin) nên UniNest chưa hiển thị giá trung bình để tránh gây hiểu nhầm.`}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  skeletonCard: {
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  insufficientCard: {
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    alignItems: 'center',
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  chartPlaceholder: {
    width: '100%',
    height: 120,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  description: { lineHeight: 20 },
});
