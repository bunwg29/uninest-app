import { useState, type ReactNode } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { GraduationCap, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AMENITY_DISPLAY_LIST, ROOM_TYPE_OPTIONS } from '@features/listings/types/constants';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Button, KeyboardAvoidingContainer, KeyboardAwareScrollView, Typography } from '@ui';
import { SEARCH_SCHOOLS, type SearchFilters } from '../types';
import { formatMillions } from '../utils';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SearchSchoolSheet } from './SearchSchoolSheet';

interface SearchFilterSheetProps {
  isVisible: boolean;
  filters: SearchFilters;
  validationMessage?: string;
  resultCount?: number;
  onChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
  onUseCurrentLocation: () => Promise<{ latitude: number; longitude: number } | null>;
}

const RADIUS_OPTIONS = [
  { value: 0.5, label: 'Dưới 500 m' },
  { value: 1, label: 'Dưới 1 km' },
  { value: 2, label: 'Dưới 2 km' },
  { value: 5, label: 'Dưới 5 km' },
] as const;

const parseNumber = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');

  if (!digits) return undefined;

  const parsedValue = Number(digits);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const formatThousands = (value?: number) =>
  value === undefined ? '' : value.toLocaleString('vi-VN');

const getPriceSummary = (minPrice?: number, maxPrice?: number) => {
  if (minPrice === undefined && maxPrice === undefined) return 'Tất cả mức giá';

  if (minPrice !== undefined && maxPrice !== undefined) {
    return `${formatMillions(minPrice)} – ${formatMillions(maxPrice)} triệu`;
  }

  return minPrice !== undefined
    ? `Từ ${formatMillions(minPrice)} triệu`
    : `Đến ${formatMillions(maxPrice ?? 0)} triệu`;
};

export const SearchFilterSheet = ({
  isVisible,
  filters,
  validationMessage,
  resultCount,
  onChange,
  onReset,
  onApply,
  onClose,
  onUseCurrentLocation,
}: SearchFilterSheetProps) => {
  const insets = useSafeAreaInsets();
  const [isSchoolSheetVisible, setIsSchoolSheetVisible] = useState(false);
  const selectedSchool = SEARCH_SCHOOLS.find((school) => school.id === filters.schoolId);
  const hasReference = filters.latitude !== undefined && filters.longitude !== undefined;
  const isCurrentLocationSelected = hasReference && !selectedSchool;

  const toggleRoomType = (roomType: string) => {
    onChange({
      roomTypes: filters.roomTypes.includes(roomType)
        ? filters.roomTypes.filter((value) => value !== roomType)
        : [...filters.roomTypes, roomType],
    });
  };

  const toggleAmenity = (amenityId: number) => {
    onChange({
      amenities: filters.amenities.includes(amenityId)
        ? filters.amenities.filter((value) => value !== amenityId)
        : [...filters.amenities, amenityId],
    });
  };

  const handleApplySchool = (schoolId: string | undefined) => {
    const school = SEARCH_SCHOOLS.find((item) => item.id === schoolId);

    onChange(
      school
        ? { schoolId: school.id, latitude: school.latitude, longitude: school.longitude }
        : { schoolId: undefined, latitude: undefined, longitude: undefined }
    );
  };

  const handleUseCurrentLocation = async () => {
    const coordinates = await onUseCurrentLocation();

    if (!coordinates) return false;

    onChange({
      schoolId: undefined,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    return true;
  };

  const handleSelectRadius = async (radius: number) => {
    if (!hasReference && !(await handleUseCurrentLocation())) return;

    onChange({ radius: filters.radius === radius ? undefined : radius });
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingContainer style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng bộ lọc"
          >
            <X size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Typography variant="h3" weight="SEMIBOLD" style={styles.headerTitle}>
            Bộ lọc
          </Typography>
          <TouchableOpacity onPress={onReset} accessibilityRole="button">
            <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
              Đặt lại
            </Typography>
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FilterSection
            title="Khoảng giá"
            summary={getPriceSummary(filters.minPrice, filters.maxPrice)}
            isFirst
          >
            <PriceRangeSlider
              minValue={filters.minPrice}
              maxValue={filters.maxPrice}
              onChange={({ minPrice, maxPrice }) => onChange({ minPrice, maxPrice })}
            />
            <View style={styles.inputRow}>
              <NumberField
                label="Tối thiểu"
                value={filters.minPrice}
                suffix="đ"
                onChange={(value) => onChange({ minPrice: value })}
              />
              <NumberField
                label="Tối đa"
                value={filters.maxPrice}
                suffix="đ"
                onChange={(value) => onChange({ maxPrice: value })}
              />
            </View>
          </FilterSection>

          <FilterSection title="Loại phòng">
            <View style={styles.wrapRow}>
              {ROOM_TYPE_OPTIONS.map((option) => (
                <OptionChip
                  key={option.value}
                  label={option.label}
                  isSelected={filters.roomTypes.includes(option.value)}
                  onPress={() => toggleRoomType(option.value)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection title="Khoảng cách">
            <TouchableOpacity
              style={styles.schoolRow}
              onPress={() => setIsSchoolSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Chọn trường tham chiếu"
            >
              <GraduationCap size={20} color={THEME_COLORS.TEXT_SECONDARY} />
              <Typography
                variant="body2"
                weight="MEDIUM"
                colorKey={hasReference ? 'TEXT_PRIMARY' : 'TEXT_PLACEHOLDER'}
                numberOfLines={1}
                style={styles.schoolName}
              >
                {selectedSchool?.name ??
                  (isCurrentLocationSelected ? 'Vị trí hiện tại của tôi' : 'Chưa chọn trường')}
              </Typography>
              <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                {hasReference ? 'Đổi' : 'Chọn'}
              </Typography>
            </TouchableOpacity>

            <View style={styles.wrapRow}>
              {RADIUS_OPTIONS.map((option) => (
                <OptionChip
                  key={option.value}
                  label={option.label}
                  isSelected={filters.radius === option.value}
                  onPress={() => void handleSelectRadius(option.value)}
                />
              ))}
            </View>

            {hasReference ? null : (
              <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                Chọn trường hoặc dùng vị trí hiện tại để lọc theo khoảng cách.
              </Typography>
            )}
          </FilterSection>

          <FilterSection title="Tiện ích">
            <View style={styles.wrapRow}>
              {AMENITY_DISPLAY_LIST.map((amenity) => (
                <OptionChip
                  key={amenity.id}
                  label={amenity.name}
                  isSelected={filters.amenities.includes(amenity.id)}
                  onPress={() => toggleAmenity(amenity.id)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection title="Diện tích" summary="m²">
            <View style={styles.inputRow}>
              <NumberField
                label="Từ"
                value={filters.minArea}
                onChange={(value) => onChange({ minArea: value })}
              />
              <NumberField
                label="Đến"
                value={filters.maxArea}
                onChange={(value) => onChange({ maxArea: value })}
              />
            </View>
          </FilterSection>

          {validationMessage ? (
            <View style={styles.validationBox}>
              <Typography variant="caption" colorKey="ERROR">
                {validationMessage}
              </Typography>
            </View>
          ) : null}
        </KeyboardAwareScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button
            title="Đặt lại"
            variant="outline"
            size="lg"
            onPress={onReset}
            style={[styles.footerButton, styles.resetButton]}
            textStyle={styles.resetButtonText}
          />
          <Button
            title={resultCount === undefined ? 'Xem kết quả' : `Xem ${resultCount} kết quả`}
            size="lg"
            onPress={onApply}
            style={styles.applyButton}
          />
        </View>

        <SearchSchoolSheet
          isVisible={isSchoolSheetVisible}
          selectedSchoolId={filters.schoolId}
          isCurrentLocationSelected={isCurrentLocationSelected}
          onApplySchool={handleApplySchool}
          onUseCurrentLocation={handleUseCurrentLocation}
          onClose={() => setIsSchoolSheetVisible(false)}
        />
      </KeyboardAvoidingContainer>
    </Modal>
  );
};

const FilterSection = ({
  title,
  summary,
  isFirst = false,
  children,
}: {
  title: string;
  summary?: string;
  isFirst?: boolean;
  children: ReactNode;
}) => (
  <View style={[styles.section, !isFirst && styles.sectionSpacing]}>
    <View style={styles.sectionHeader}>
      <Typography variant="h3" weight="SEMIBOLD" style={styles.sectionTitle}>
        {title}
      </Typography>
      {summary ? (
        <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
          {summary}
        </Typography>
      ) : null}
    </View>
    {children}
  </View>
);

const OptionChip = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.chip, isSelected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isSelected }}
  >
    <Typography
      variant="body2"
      weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
      colorKey={isSelected ? 'PRIMARY_DARK' : 'TEXT_SECONDARY'}
    >
      {label}
    </Typography>
  </TouchableOpacity>
);

const NumberField = ({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value?: number;
  suffix?: string;
  onChange: (value?: number) => void;
}) => (
  <View style={styles.numberField}>
    <Typography
      variant="caption"
      weight="MEDIUM"
      colorKey="TEXT_PLACEHOLDER"
      style={styles.fieldLabel}
    >
      {label}
    </Typography>
    <View style={styles.numberInputBox}>
      <TextInput
        value={formatThousands(value)}
        onChangeText={(text) => onChange(parseNumber(text))}
        keyboardType="numeric"
        placeholder="Không giới hạn"
        placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
        style={styles.numberInput}
        accessibilityLabel={label}
      />
      {suffix && value !== undefined ? (
        <Typography variant="body2" weight="SEMIBOLD">
          {suffix}
        </Typography>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, lineHeight: 26 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  section: { gap: 12 },
  sectionSpacing: { marginTop: 36 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, lineHeight: 26 },
  inputRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  numberField: { flex: 1, minWidth: 0, gap: 6 },
  fieldLabel: { letterSpacing: 0.2 },
  numberInputBox: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  numberInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  chipSelected: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  schoolRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  schoolName: { flex: 1, minWidth: 0 },
  validationBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  footerButton: { flex: 1 },
  resetButton: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.SURFACE },
  resetButtonText: { color: THEME_COLORS.PRIMARY_DARK },
  applyButton: { flex: 2.1 },
});
