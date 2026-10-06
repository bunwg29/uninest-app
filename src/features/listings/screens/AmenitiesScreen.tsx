import { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Button, Typography, ScreenContainer, FilterChip } from '@ui';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { AMENITY_DISPLAY_LIST } from '../types/constants';
import { WizardHeader } from '../components/landlord/WizardHeader';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const GROUPS = [...new Set(AMENITY_DISPLAY_LIST.map((a) => a.group))];

export const AmenitiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedAmenityIds, setSelectedAmenityIds, editingListingId } = useListingPostStore();

  const handleToggle = useCallback(
    (id: number) => {
      const next = selectedAmenityIds.includes(id)
        ? selectedAmenityIds.filter((item) => item !== id)
        : [...selectedAmenityIds, id];

      setSelectedAmenityIds(next);
    },
    [selectedAmenityIds, setSelectedAmenityIds]
  );

  const handleContinue = useCallback(() => {
    navigation.navigate('ListingPostSchedule');
  }, [navigation]);

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <WizardHeader step={4} isEditing={Boolean(editingListingId)} onBack={navigation.goBack} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Typography variant="h2" weight="BOLD" style={styles.title}>
            Phòng có những gì?
          </Typography>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
            {selectedAmenityIds.length > 0
              ? `Đã chọn ${selectedAmenityIds.length} tiện ích. Sinh viên lọc theo đúng những mục này.`
              : 'Sinh viên lọc phòng theo đúng những mục này.'}
          </Typography>
        </View>

        {GROUPS.map((group) => (
          <View key={group} style={styles.group}>
            <Typography
              variant="caption"
              weight="BOLD"
              colorKey="TEXT_MUTED"
              style={styles.groupTitle}
            >
              {group.toUpperCase()}
            </Typography>

            <View style={styles.chipRow}>
              {AMENITY_DISPLAY_LIST.filter((a) => a.group === group).map((amenity) => (
                <FilterChip
                  key={amenity.id}
                  label={amenity.name}
                  isSelected={selectedAmenityIds.includes(amenity.id)}
                  onPress={() => handleToggle(amenity.id)}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button variant="primary" size="lg" fullWidth onPress={handleContinue}>
          Tiếp tục
        </Button>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: SPACING_TOKENS.XL, gap: 24 },
  intro: { gap: 6 },
  title: { letterSpacing: -0.3 },
  subtitle: { lineHeight: 22 },
  group: { gap: 12 },
  groupTitle: { letterSpacing: 0.8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 16 },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
