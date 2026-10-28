import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ChevronRight, FileText, Trash2 } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { HeaderBar, Modal, NoticeBanner, ScreenContainer, SkeletonBox, Typography } from '@ui';
import type { RootStackParamList } from '@navigation';
import { useBehaviorSummary, useDeleteBehaviors } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonalizationData'>;

export const PersonalizationDataScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const summaryQuery = useBehaviorSummary();
  const deleteBehaviors = useDeleteBehaviors();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const summaryRows = [
    { label: 'Phòng đã xem', value: summaryQuery.data?.viewedCount },
    { label: 'Phòng đã lưu', value: summaryQuery.data?.savedCount },
    { label: 'Lượt tìm kiếm', value: summaryQuery.data?.searchCount },
  ];

  const handleConfirmDelete = () => {
    deleteBehaviors.mutate(undefined, {
      onSettled: () => setIsConfirmVisible(false),
    });
  };

  const renderSummary = () => {
    if (summaryQuery.isLoading) {
      return (
        <View style={styles.skeleton}>
          {summaryRows.map((row) => (
            <SkeletonBox key={row.label} height={20} />
          ))}
        </View>
      );
    }

    if (summaryQuery.isError) {
      return (
        <View style={styles.errorRow}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Không tải được số liệu.
          </Typography>

          <TouchableOpacity onPress={() => void summaryQuery.refetch()} accessibilityRole="button">
            <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
              Thử lại
            </Typography>
          </TouchableOpacity>
        </View>
      );
    }

    return summaryRows.map((row) => (
      <View key={row.label} style={styles.summaryRow}>
        <Typography variant="body2" colorKey="TEXT_SECONDARY">
          {row.label}
        </Typography>

        <Typography variant="body2" weight="BOLD" colorKey="TEXT_PRIMARY">
          {String(row.value ?? 0)}
        </Typography>
      </View>
    ));
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <HeaderBar
        title="Quyền riêng tư & dữ liệu"
        alignTitle="left"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.cardTitle}
          >
            DỮ LIỆU DÙNG ĐỂ CÁ NHÂN HOÁ
          </Typography>

          {renderSummary()}

          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            Chỉ dùng hành vi của chính bạn để gợi ý phòng, không chia sẻ cho người khác.
          </Typography>
        </View>

        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.sectionTitle}
        >
          QUẢN LÝ DỮ LIỆU
        </Typography>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setIsConfirmVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={[styles.menuIcon, styles.menuIconWarning]}>
              <Trash2 size={18} color={THEME_COLORS.WARNING} />
            </View>

            <Typography
              variant="body2"
              weight="MEDIUM"
              color={THEME_COLORS.WARNING}
              style={styles.menuLabel}
            >
              Xoá lịch sử xem & tìm kiếm
            </Typography>

            <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowLast]}
            onPress={() => navigation.navigate('Terms', { tab: 'privacy' })}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={styles.menuIcon}>
              <FileText size={18} color={THEME_COLORS.PRIMARY} />
            </View>

            <Typography
              variant="body2"
              weight="MEDIUM"
              colorKey="TEXT_PRIMARY"
              style={styles.menuLabel}
            >
              Chính sách quyền riêng tư
            </Typography>

            <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        isVisible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        title="Xoá lịch sử xem và tìm kiếm?"
        description="Gợi ý cá nhân hoá sẽ quay về mặc định, trang chủ hiển thị phòng phổ biến trong khu vực thay vì phòng hợp gu bạn."
        confirmText="Xoá lịch sử"
        cancelText="Huỷ"
        confirmVariant="danger"
        isConfirmLoading={deleteBehaviors.isPending}
        onConfirm={handleConfirmDelete}
      >
        <NoticeBanner tone="success" icon={Check} style={styles.notice}>
          Phòng đã lưu, lịch hẹn và tin nhắn không bị ảnh hưởng.
        </NoticeBanner>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING_TOKENS.MD,
  },
  card: {
    gap: SPACING_TOKENS.SM + 4,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardTitle: {
    letterSpacing: 0.6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeleton: {
    gap: SPACING_TOKENS.SM + 4,
  },
  errorRow: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: SPACING_TOKENS.LG,
    marginBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.6,
  },
  menu: {
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    minHeight: 56,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWarning: {
    backgroundColor: OVERLAY_COLORS.AMBER_NOTICE_BACKGROUND,
  },
  menuLabel: {
    flex: 1,
  },
  notice: {
    marginTop: SPACING_TOKENS.SM,
  },
});
