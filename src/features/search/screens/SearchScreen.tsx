import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Scale, Search } from 'lucide-react-native';
import { useComparisonStore } from '@features/comparison';
import type { MainTabParamList, RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

export const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const comparisonCount = useComparisonStore((state) => state.items.length);

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title="Tìm trọ"
        rightAction={
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => navigation.navigate('Comparison')}
            accessibilityLabel="Mở danh sách so sánh"
          >
            <Scale size={21} color={THEME_COLORS.PRIMARY} />
            {comparisonCount > 0 ? (
              <View style={styles.comparisonBadge}>
                <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WHITE}>
                  {comparisonCount}
                </Typography>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      <EmptyState
        title="Tìm kiếm phòng trọ"
        description="Danh sách kết quả tìm kiếm đang chờ API tìm kiếm của Sprint 2."
        icon={<Search size={38} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        style={styles.emptyState}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  emptyState: { flex: 1 },
  compareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonBadge: {
    position: 'absolute',
    top: SPACING_TOKENS.XXS,
    right: SPACING_TOKENS.XXS,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
