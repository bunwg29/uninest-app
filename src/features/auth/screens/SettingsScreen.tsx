import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  Shield,
  Sun,
  Type,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;
type IconComponent = typeof Sun;

type SettingTone = {
  foreground: string;
  background: string;
};

const SETTING_TONES = {
  BLUE: { foreground: THEME_COLORS.PRIMARY, background: THEME_COLORS.PRIMARY_LIGHT },
  GREEN: { foreground: THEME_COLORS.SUCCESS, background: THEME_COLORS.SUCCESS_LIGHT },
  AMBER: { foreground: THEME_COLORS.WARNING, background: THEME_COLORS.WARNING_LIGHT },
  SLATE: { foreground: THEME_COLORS.TEXT_MUTED, background: THEME_COLORS.SURFACE_MUTED },
} satisfies Record<string, SettingTone>;

interface SettingItem {
  label: string;
  icon: IconComponent;
  tone: SettingTone;
  value?: string;
  onPress?: () => void;
}

export const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();

  const showComingSoon = (label: string) => {
    toast.info(`${label} đang được phát triển`);
  };

  const appearanceItems: SettingItem[] = [
    {
      label: 'Chế độ hiển thị',
      icon: Sun,
      tone: SETTING_TONES.SLATE,
      value: 'Theo hệ thống',
      onPress: () => showComingSoon('Chế độ hiển thị'),
    },
    {
      label: 'Cỡ chữ',
      icon: Type,
      tone: SETTING_TONES.SLATE,
      value: 'Vừa',
      onPress: () => showComingSoon('Cỡ chữ'),
    },
  ];

  const accountItems: SettingItem[] = [
    {
      label: 'Thông báo',
      icon: Bell,
      tone: SETTING_TONES.BLUE,
      onPress: () => showComingSoon('Thông báo'),
    },
    {
      label: 'Đổi mật khẩu',
      icon: LockKeyhole,
      tone: SETTING_TONES.SLATE,
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      label: 'Quyền riêng tư & dữ liệu',
      icon: Shield,
      tone: SETTING_TONES.SLATE,
      onPress: () => showComingSoon('Quyền riêng tư & dữ liệu'),
    },
  ];

  const aboutItems: SettingItem[] = [
    {
      label: 'Điều khoản sử dụng',
      icon: FileText,
      tone: SETTING_TONES.SLATE,
      onPress: () => showComingSoon('Điều khoản sử dụng'),
    },
  ];

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={22} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>

        <Typography variant="h3" weight="BOLD">
          Cài đặt
        </Typography>

        <View style={styles.headerSpace} />
      </View>

      <SettingsSection title="GIAO DIỆN" items={appearanceItems} />
      <SettingsSection title="TÀI KHOẢN" items={accountItems} />
      <SettingsSection title="VỀ ỨNG DỤNG" items={aboutItems} />
    </ScreenContainer>
  );
};

const SettingsSection = ({ title, items }: { title: string; items: SettingItem[] }) => (
  <View style={styles.section}>
    <Typography
      variant="tiny"
      weight="BOLD"
      color={THEME_COLORS.TEXT_MUTED}
      style={styles.sectionTitle}
    >
      {title}
    </Typography>

    <View style={styles.sectionCard}>
      {items.map((item, index) => (
        <SettingRow key={item.label} item={item} isLast={index === items.length - 1} />
      ))}
    </View>
  </View>
);

const SettingRow = ({ item, isLast }: { item: SettingItem; isLast?: boolean }) => {
  const Icon = item.icon;

  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconFrame, { backgroundColor: item.tone.background }]}>
        <Icon size={18} color={item.tone.foreground} />
      </View>

      <Typography variant="body2" weight="MEDIUM" style={styles.rowLabel}>
        {item.label}
      </Typography>

      {item.value ? (
        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.value}>
          {item.value}
        </Typography>
      ) : null}

      <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  headerSpace: {
    width: 40,
  },
  section: {
    marginBottom: SPACING_TOKENS.MD,
  },
  sectionTitle: {
    marginHorizontal: SPACING_TOKENS.LG,
    marginBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconFrame: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    marginLeft: SPACING_TOKENS.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  value: {
    marginRight: SPACING_TOKENS.SM,
  },
});
