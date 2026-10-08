import type { ComponentType } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Eye, KeyRound, LogOut, Settings2, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { GradientAvatar, Typography } from '@ui';

interface LandlordAccountSheetProps {
  isVisible: boolean;
  fullName?: string;
  contact?: string;
  avatarUrl?: string | null;
  onViewPublicProfile: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onClose: () => void;
}

interface MenuItemProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  isDanger?: boolean;
  onPress: () => void;
}

const MenuItem = ({ icon: Icon, label, isDanger = false, onPress }: MenuItemProps) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={[styles.itemIcon, isDanger && styles.itemIconDanger]}>
      <Icon size={19} color={isDanger ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_SECONDARY} />
    </View>

    <Typography
      variant="body1"
      weight="SEMIBOLD"
      color={isDanger ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_PRIMARY}
    >
      {label}
    </Typography>
  </TouchableOpacity>
);

export const LandlordAccountSheet = ({
  isVisible,
  fullName,
  contact,
  avatarUrl,
  onViewPublicProfile,
  onEditProfile,
  onChangePassword,
  onOpenSettings,
  onLogout,
  onClose,
}: LandlordAccountSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Đóng menu tài khoản"
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.profile}>
            <GradientAvatar name={fullName} uri={avatarUrl} size={48} />

            <View style={styles.profileBody}>
              <Typography variant="body1" weight="BOLD" numberOfLines={1}>
                {fullName ?? 'Chủ trọ'}
              </Typography>
              {contact ? (
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  {contact}
                </Typography>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          <MenuItem icon={Eye} label="Hồ sơ công khai" onPress={onViewPublicProfile} />
          <MenuItem icon={UserRound} label="Chỉnh sửa hồ sơ" onPress={onEditProfile} />
          <MenuItem icon={KeyRound} label="Đổi mật khẩu" onPress={onChangePassword} />
          <MenuItem icon={Settings2} label="Cài đặt ứng dụng" onPress={onOpenSettings} />

          <View style={styles.divider} />

          <MenuItem icon={LogOut} label="Đăng xuất" isDanger onPress={onLogout} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: OVERLAY_COLORS.MODAL_BACKDROP },
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileBody: { flex: 1, gap: 2 },
  divider: {
    height: 1,
    marginVertical: SPACING_TOKENS.SM + 2,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  item: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  itemIconDanger: { backgroundColor: THEME_COLORS.ERROR_LIGHT },
});
