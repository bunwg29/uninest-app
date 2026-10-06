import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import { SEARCH_SCHOOLS } from '../types';
import { RadioMark } from './RadioMark';

const CURRENT_LOCATION_ID = 'current-location';

interface SearchSchoolSheetProps {
  isVisible: boolean;
  selectedSchoolId?: string;
  onApplySchool: (schoolId: string | undefined) => void;
  onUseCurrentLocation: () => void;
  onClose: () => void;
}

const removeDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

export const SearchSchoolSheet = ({
  isVisible,
  selectedSchoolId,
  onApplySchool,
  onUseCurrentLocation,
  onClose,
}: SearchSchoolSheetProps) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<string | undefined>(selectedSchoolId);

  useEffect(() => {
    if (isVisible) {
      setPendingId(selectedSchoolId);
      setQuery('');
    }
  }, [isVisible, selectedSchoolId]);

  const schools = useMemo(() => {
    const normalizedQuery = removeDiacritics(query.trim());

    if (!normalizedQuery) return SEARCH_SCHOOLS;

    return SEARCH_SCHOOLS.filter((school) =>
      removeDiacritics(`${school.name} ${school.shortName}`).includes(normalizedQuery)
    );
  }, [query]);

  const handleApply = () => {
    if (pendingId === CURRENT_LOCATION_ID) {
      onUseCurrentLocation();
    } else {
      onApplySchool(pendingId);
    }

    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Quay lại bộ lọc"
          >
            <ChevronLeft size={22} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Typography variant="h3" weight="SEMIBOLD" style={styles.headerTitle}>
            Chọn trường tham chiếu
          </Typography>
        </View>

        <View style={styles.searchField}>
          <Search size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm tên trường…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            autoCapitalize="none"
            accessibilityLabel="Tìm tên trường"
            style={styles.searchInput}
          />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {schools.length > 0 ? (
            <Typography
              variant="caption"
              weight="MEDIUM"
              colorKey="TEXT_PLACEHOLDER"
              style={styles.sectionLabel}
            >
              ĐÀ NẴNG
            </Typography>
          ) : null}

          {schools.map((school) => (
            <SchoolOption
              key={school.id}
              title={school.name}
              subtitle={school.address}
              isSelected={pendingId === school.id}
              onPress={() => setPendingId(school.id)}
            />
          ))}

          {schools.length === 0 ? (
            <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.emptyText}>
              Không tìm thấy trường phù hợp.
            </Typography>
          ) : null}

          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.sectionLabel}
          >
            KHÁC
          </Typography>
          <SchoolOption
            title="Dùng vị trí hiện tại của tôi"
            subtitle="Tính khoảng cách từ nơi bạn đang đứng"
            isSelected={pendingId === CURRENT_LOCATION_ID}
            onPress={() => setPendingId(CURRENT_LOCATION_ID)}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button title="Áp dụng" size="lg" onPress={handleApply} />
        </View>
      </View>
    </Modal>
  );
};

const SchoolOption = ({
  title,
  subtitle,
  isSelected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <View>
    <TouchableOpacity
      style={[styles.option, isSelected && styles.optionSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <RadioMark isSelected={isSelected} />
      <View style={styles.optionText}>
        <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={1}
          >
            {subtitle}
          </Typography>
        ) : null}
      </View>
    </TouchableOpacity>
    <View style={styles.divider} />
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
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, lineHeight: 26 },
  searchField: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  searchInput: { flex: 1, padding: 0, color: THEME_COLORS.TEXT_PRIMARY, fontSize: 14 },
  sectionLabel: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, letterSpacing: 0.2 },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionSelected: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  optionText: { flex: 1, minWidth: 0 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  emptyText: { paddingHorizontal: 16, paddingVertical: 16 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
