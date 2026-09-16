import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlusCircle, Building2 } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography } from '@ui';
import { useRoleGuard } from '@features/auth';
import type { RootStackParamList } from '@navigation';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLandlord } = useRoleGuard();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Building2 size={40} color={THEME_COLORS.PRIMARY} />
        </View>

        <Typography variant="h2" weight="BOLD" colorKey="TEXT_PRIMARY" style={styles.title}>
          UniNest
        </Typography>

        <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
          Nền tảng tìm kiếm và đăng tin phòng trọ cho sinh viên
        </Typography>

        {isLandlord ? (
          <View style={styles.card}>
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Dành cho Chủ trọ
            </Typography>
            <Typography variant="caption" colorKey="TEXT_SECONDARY" style={styles.cardDesc}>
              Đăng tin phòng trọ của bạn để tiếp cận hàng ngàn sinh viên đang tìm kiếm phòng ở.
            </Typography>

            <Button
              title="Đăng tin cho thuê"
              variant="primary"
              leftIcon={<PlusCircle size={18} color={THEME_COLORS.SURFACE} />}
              onPress={() => navigation.navigate('ListingPost')}
              style={styles.postButton}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Tìm phòng trọ lý tưởng
            </Typography>
            <Typography variant="caption" colorKey="TEXT_SECONDARY" style={styles.cardDesc}>
              Khám phá các phòng trọ tiện nghi, an ninh và vị trí thuận tiện gần trường học của bạn.
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING_TOKENS.LG,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: SPACING_TOKENS.XL,
  },
  card: {
    width: '100%',
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    padding: SPACING_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    alignItems: 'center',
  },
  cardDesc: {
    textAlign: 'center',
    marginTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.MD,
  },
  postButton: {
    width: '100%',
  },
});
