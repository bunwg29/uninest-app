import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Info } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography, BackButton } from '@ui';
import type { AuthStackParamList } from '@navigation';
import { RoleCard } from '../components';
import { useAuth } from '../hooks';
import type { UserRole } from '../types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const RoleSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleContinue = async () => {
    await selectRole(selectedRole);

    navigation.navigate('Register', { role: selectedRole });
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.topNav}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Bạn đăng ký với vai trò nào?
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          Chọn đúng vai trò giúp UniNest phục vụ bạn tốt nhất.
        </Typography>
      </View>

      <View style={styles.cardList}>
        <RoleCard
          role="student"
          title="Tôi là sinh viên"
          description="Tìm phòng trọ, bạn cùng phòng ghép và quản lý hợp đồng thuê"
          isSelected={selectedRole === 'student'}
          onSelect={(role) => setSelectedRole(role)}
        />

        <RoleCard
          role="landlord"
          title="Tôi là chủ trọ"
          description="Đăng tin cho thuê, quản lý phòng và tiếp cận hàng nghìn sinh viên"
          isSelected={selectedRole === 'landlord'}
          onSelect={(role) => setSelectedRole(role)}
        />
      </View>

      <View style={styles.noticeBox}>
        <Info size={18} color={THEME_COLORS.TEXT_MUTED} style={styles.noticeIcon} />

        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.noticeText}>
          Chủ nhà cần xác thực CCCD/giấy phép kinh doanh trước khi đăng tin.
        </Typography>
      </View>

      <View style={styles.actionContainer}>
        <Button variant="primary" size="lg" fullWidth onPress={handleContinue}>
          Tiếp tục
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.LG,
    paddingVertical: SPACING_TOKENS.MD,
    justifyContent: 'space-between',
  },
  topNav: {
    paddingTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.SM,
  },
  header: {
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.XL,
  },
  title: {
    lineHeight: 40,
    marginBottom: SPACING_TOKENS.SM,
  },
  subtitle: {
    lineHeight: 22,
  },
  cardList: {
    marginBottom: SPACING_TOKENS.LG,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    marginBottom: SPACING_TOKENS.XL,
  },
  noticeIcon: {
    marginRight: SPACING_TOKENS.SM,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 'auto',
    paddingBottom: SPACING_TOKENS.LG,
  },
});
