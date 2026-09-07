import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Info } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, ScreenContainer, Typography } from '@ui';
import type { AuthStackParamList } from '@navigation';
import { RoleCard } from '../components';
import { useAuth } from '../hooks';
import type { UserRole } from '../types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const RoleSelectionScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { selectRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleContinue = async () => {
    await selectRole(selectedRole);

    navigation.navigate('Login');
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD" style={styles.title}>
          {t('auth.role.title')}
        </Typography>

        <Typography variant="body1" color={THEME_COLORS.TEXT_SECONDARY} style={styles.subtitle}>
          {t('auth.role.subtitle')}
        </Typography>
      </View>

      <View style={styles.cardList}>
        <RoleCard
          role="student"
          title={t('auth.role.studentTitle')}
          description={t('auth.role.studentDesc')}
          isSelected={selectedRole === 'student'}
          onSelect={(role) => setSelectedRole(role)}
        />

        <RoleCard
          role="landlord"
          title={t('auth.role.landlordTitle')}
          description={t('auth.role.landlordDesc')}
          isSelected={selectedRole === 'landlord'}
          onSelect={(role) => setSelectedRole(role)}
        />
      </View>

      <View style={styles.noticeBox}>
        <Info size={18} color={THEME_COLORS.TEXT_MUTED} style={styles.noticeIcon} />

        <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.noticeText}>
          {t('auth.role.landlordNotice')}
        </Typography>
      </View>

      <View style={styles.actionContainer}>
        <Button variant="primary" size="lg" fullWidth onPress={handleContinue}>
          {t('auth.role.continue')}
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
  header: {
    marginTop: SPACING_TOKENS.LG,
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
