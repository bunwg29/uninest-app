import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AMENITY_DISPLAY_LIST, ROOM_TYPE_OPTIONS } from '@features/listings/types/constants';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, FilterChip, Typography } from '@ui';
import { SEARCH_SCHOOLS, type SearchFilters } from '../types';

interface SearchFilterSheetProps {
  isVisible: boolean;
  filters: SearchFilters;
  validationMessage?: string;
  onChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}

const RADIUS_OPTIONS = [1, 2, 3, 5, 10] as const;

const parseNumber = (value: string) => {
  if (!value.trim()) return undefined;

  const parsedValue = Number(value.replace(/[^0-9]/g, ''));

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export const SearchFilterSheet = ({
  isVisible,
  filters,
  validationMessage,
  onChange,
  onReset,
  onApply,
  onClose,
}: SearchFilterSheetProps) => {
  const insets = useSafeAreaInsets();

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

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng bộ lọc"
          >
            <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Typography variant="h2" weight="BOLD" style={styles.headerTitle}>
            Bộ lọc
          </Typography>
          <TouchableOpacity onPress={onReset} accessibilityRole="button">
            <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY">
              Đặt lại
            </Typography>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FilterSection title="Khoảng giá" subtitle="đồng / tháng">
            <View style={styles.inputRow}>
              <NumberField
                label="Tối thiểu"
                value={filters.minPrice}
                onChange={(value) => onChange({ minPrice: value })}
              />
              <View style={styles.inputSeparator} />
              <NumberField
                label="Tối đa"
                value={filters.maxPrice}
                onChange={(value) => onChange({ maxPrice: value })}
              />
            </View>
          </FilterSection>

          <FilterSection title="Diện tích" subtitle="m²">
            <View style={styles.inputRow}>
              <NumberField
                label="Từ"
                value={filters.minArea}
                onChange={(value) => onChange({ minArea: value })}
              />
              <View style={styles.inputSeparator} />
              <NumberField
                label="Đến"
                value={filters.maxArea}
                onChange={(value) => onChange({ maxArea: value })}
              />
            </View>
          </FilterSection>

          <FilterSection title="Loại phòng">
            <View style={styles.wrapRow}>
              {ROOM_TYPE_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={filters.roomTypes.includes(option.value)}
                  onPress={() => toggleRoomType(option.value)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection title="Tiện ích">
            <View style={styles.wrapRow}>
              {AMENITY_DISPLAY_LIST.map((amenity) => (
                <FilterChip
                  key={amenity.id}
                  label={amenity.name}
                  isSelected={filters.amenities.includes(amenity.id)}
                  onPress={() => toggleAmenity(amenity.id)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection
            title="Khoảng cách tới trường"
            subtitle={
              SEARCH_SCHOOLS.find((school) => school.id === filters.schoolId)?.name ??
              'Chưa chọn trường'
            }
          >
            <View style={styles.wrapRow}>
              {SEARCH_SCHOOLS.map((school) => (
                <FilterChip
                  key={school.id}
                  label={school.name}
                  isSelected={filters.schoolId === school.id}
                  onPress={() =>
                    onChange(
                      filters.schoolId === school.id
                        ? { schoolId: undefined, latitude: undefined, longitude: undefined }
                        : {
                            schoolId: school.id,
                            latitude: school.latitude,
                            longitude: school.longitude,
                          }
                    )
                  }
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection
            title="Bán kính tìm"
            subtitle={filters.radius === undefined ? 'Không giới hạn' : `${filters.radius} km`}
          >
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    filters.radius === radius && styles.radiusButtonSelected,
                  ]}
                  onPress={() =>
                    onChange({ radius: filters.radius === radius ? undefined : radius })
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected: filters.radius === radius }}
                >
                  <Typography
                    variant="caption"
                    weight="SEMIBOLD"
                    colorKey={filters.radius === radius ? 'PRIMARY' : 'TEXT_SECONDARY'}
                  >
                    {radius} km
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </FilterSection>

          {validationMessage ? (
            <View style={styles.validationBox}>
              <Typography variant="caption" colorKey="ERROR">
                {validationMessage}
              </Typography>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button title="Đặt lại" variant="outline" onPress={onReset} style={styles.footerButton} />
          <Button title="Xem kết quả" onPress={onApply} style={styles.applyButton} />
        </View>
      </View>
    </Modal>
  );
};

const FilterSection = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Typography variant="body1" weight="BOLD">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {subtitle}
        </Typography>
      ) : null}
    </View>
    {children}
  </View>
);

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value?: number) => void;
}) => (
  <View style={styles.numberField}>
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <TextInput
      value={value === undefined ? '' : String(value)}
      onChangeText={(text) => onChange(parseNumber(text))}
      keyboardType="numeric"
      placeholder="Không giới hạn"
      placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
      style={styles.numberInput}
      accessibilityLabel={label}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1 },
  content: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  section: {
    paddingVertical: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  inputSeparator: { width: 12, height: 1, backgroundColor: THEME_COLORS.TEXT_PLACEHOLDER },
  numberField: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  numberInput: { height: 24, padding: 0, color: THEME_COLORS.TEXT_PRIMARY, fontSize: 14 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  radiusRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  radiusButton: {
    flex: 1,
    minWidth: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  radiusButtonSelected: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  validationBox: {
    marginTop: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  footerButton: { flex: 1 },
  applyButton: { flex: 1.6 },
});
