import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@navigation';
import { OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography, BackButton } from '@ui';
import { SEARCH_SCHOOLS, useSearchStore } from '@features/search';
import { AddComparisonSheet } from '../components/AddComparisonSheet';
import { ComparisonEmptyState } from '../components/ComparisonEmptyState';
import { ComparisonTable } from '../components/ComparisonTable';
import { useClearComparison, useComparison, useRemoveComparison } from '../hooks';
import { MAX_COMPARISON_ITEMS } from '../store';

type ComparisonNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ComparisonScreen = () => {
  const navigation = useNavigation<ComparisonNavigation>();
  const insets = useSafeAreaInsets();
  const { items, isFull, isLoading } = useComparison();
  const remove = useRemoveComparison();
  const clear = useClearComparison();
  const filters = useSearchStore((state) => state.appliedFilters);
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const isEmpty = items.length === 0;
  const school = SEARCH_SCHOOLS.find((item) => item.id === filters.schoolId);
  const hasReference = filters.latitude !== undefined && filters.longitude !== undefined;
  const referenceLabel = school ? school.shortName : hasReference ? 'bạn' : null;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      return;
    }

    navigation.navigate('Main');
  };

  return (
    <View style={[styles.root, isEmpty ? styles.rootEmpty : styles.rootFilled]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <BackButton onPress={handleBack} accessibilityLabel="Quay lại" />

          <Typography variant="h3" weight="SEMIBOLD" numberOfLines={1} style={styles.title}>
            {isEmpty ? 'So sánh phòng' : `So sánh phòng (${items.length}/${MAX_COMPARISON_ITEMS})`}
          </Typography>

          {!isEmpty ? (
            <TouchableOpacity
              onPress={clear}
              accessibilityRole="button"
              accessibilityLabel="Xoá danh sách so sánh"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Typography variant="body2" weight="SEMIBOLD" colorKey="ERROR">
                Xoá hết
              </Typography>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        {isEmpty ? (
          isLoading ? null : (
            <ComparisonEmptyState />
          )
        ) : (
          <ComparisonTable
            items={items}
            reference={filters}
            referenceLabel={referenceLabel}
            onRemove={remove}
            onOpenDetail={(id) => navigation.navigate('ListingDetail', { id })}
          />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.SM) }]}>
        {isEmpty ? (
          <Button
            title="Tìm phòng ngay"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Main')}
          />
        ) : (
          <Button
            title="+ Thêm phòng để so sánh"
            variant="outline"
            size="lg"
            fullWidth
            disabled={isFull}
            onPress={() => setIsAddSheetVisible(true)}
            style={isFull ? styles.fullButton : styles.addButton}
            textStyle={isFull ? styles.fullButtonText : styles.addButtonText}
          />
        )}

        {isFull ? (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            align="center"
            style={styles.limitHint}
          >
            {`Tối đa ${MAX_COMPARISON_ITEMS} phòng — bỏ bớt một phòng để thêm mới`}
          </Typography>
        ) : null}
      </View>

      <AddComparisonSheet
        isVisible={isAddSheetVisible}
        referenceLabel={referenceLabel}
        onClose={() => setIsAddSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootEmpty: { backgroundColor: THEME_COLORS.BACKGROUND },
  rootFilled: { backgroundColor: THEME_COLORS.SURFACE },
  header: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  title: { flex: 1 },
  body: { flex: 1 },
  footer: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  addButton: { borderColor: THEME_COLORS.PRIMARY },
  addButtonText: { color: THEME_COLORS.PRIMARY_DARK },
  fullButton: {
    opacity: 1,
    borderWidth: 0,
    backgroundColor: THEME_COLORS.BORDER,
  },
  fullButtonText: { color: OVERLAY_COLORS.STEP_PENDING_TEXT },
  limitHint: { marginTop: SPACING_TOKENS.SM + SPACING_TOKENS.XS, marginBottom: SPACING_TOKENS.XS },
});
