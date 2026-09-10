import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Info } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography, HeaderBar, ScreenContainer, FilterChip } from '@ui';
import type { ListingPostStackParamList } from '@navigation';
import { LISTING_FORM_STEPS, AMENITY_DISPLAY_LIST } from '../types/constants';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const TOTAL_STEPS = LISTING_FORM_STEPS.length;

const GROUPS = [...new Set(AMENITY_DISPLAY_LIST.map((a) => a.group))];

export const AmenitiesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);

      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    navigation.navigate('ListingPostSchedule');
  }, [navigation]);

  return (
    <ScreenContainer applyTopInset applyBottomInset={false} keyboardAvoiding={false}>
      <HeaderBar
        title="Đăng tin mới"
        onBack={() => navigation.goBack()}
        subtitle={`Bước 4 / ${TOTAL_STEPS}: Tiện ích`}
        alignTitle="left"
      />

      <StepIndicator currentStep={4} totalSteps={TOTAL_STEPS} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.blockBanner}>
          <Info size={16} color={THEME_COLORS.WARNING} />

          <Typography variant="caption" colorKey="WARNING" style={styles.bannerText}>
            Tính năng chọn tiện ích sẽ sớm được tích hợp đầy đủ. Hiện tại danh sách chỉ để tham khảo
            và không ảnh hưởng đến tin đăng.
          </Typography>
        </View>

        {GROUPS.map((group) => (
          <View key={group} style={styles.group}>
            <Typography
              variant="label"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.groupTitle}
            >
              {group}
            </Typography>

            <View style={styles.chipRow}>
              {AMENITY_DISPLAY_LIST.filter((a) => a.group === group).map((amenity) => (
                <FilterChip
                  key={amenity.name}
                  label={amenity.name}
                  isSelected={selectedNames.has(amenity.name)}
                  onPress={() => handleToggle(amenity.name)}
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

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = currentStep / totalSteps;

  return (
    <View style={indicatorStyles.container}>
      <View style={indicatorStyles.track}>
        <View style={[indicatorStyles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  track: {
    height: 4,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  blockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.WARNING + '40',
  },
  bannerText: {
    flex: 1,
    lineHeight: 18,
  },
  group: {
    marginBottom: SPACING_TOKENS.MD,
  },
  groupTitle: {
    marginBottom: SPACING_TOKENS.SM,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
  },
  chip: {
    marginBottom: 0,
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
