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

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h2" weight="BOLD">
          Cài đặt
        </Typography>
        <View style={styles.headerSpace} />
      </View>

      <SettingsSection title="GIAO DIỆN" items={appearanceItems} />
      <SettingsSection title="TÀI KHOẢN" items={accountItems} />

      <Typography
        variant="tiny"
        weight="SEMIBOLD"
        color={THEME_COLORS.TEXT_MUTED}
        style={styles.sectionTitle}
      >
        VỀ ỨNG DỤNG
      </Typography>
      <SettingRow
        item={{
          label: 'Điều khoản sử dụng',
          icon: FileText,
          tone: SETTING_TONES.SLATE,
          onPress: () => showComingSoon('Điều khoản sử dụng'),
        }}
      />
    </ScreenContainer>
  );
};

const SettingsSection = ({ title, items }: { title: string; items: SettingItem[] }) => (
  <View>
    <Typography
      variant="tiny"
      weight="SEMIBOLD"
      color={THEME_COLORS.TEXT_MUTED}
      style={styles.sectionTitle}
    >
      {title}
    </Typography>
    {items.map((item) => (
      <SettingRow key={item.label} item={item} />
    ))}
  </View>
);

const SettingRow = ({ item }: { item: SettingItem }) => {
  const Icon = item.icon;

  return (
    <TouchableOpacity style={styles.row} onPress={item.onPress}>
      <View style={[styles.iconFrame, { backgroundColor: item.tone.background }]}>
        <Icon size={19} color={item.tone.foreground} />
      </View>
      <Typography variant="body2" style={styles.rowLabel}>
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
  container: { paddingTop: 0 },
  header: {
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.LG,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  backButton: { padding: SPACING_TOKENS.XS, marginRight: SPACING_TOKENS.SM },
  headerSpace: { flex: 1 },
  sectionTitle: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.SM,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  iconFrame: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  rowLabel: { flex: 1, marginLeft: SPACING_TOKENS.SM },
  value: { marginRight: SPACING_TOKENS.SM },
});
