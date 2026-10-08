import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Check, GraduationCap, Plus, Search, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BottomSheet, Button, Input, Typography } from '@ui';
import { useDebouncedValue, useToast } from '@hooks';
import { universitiesService, type University } from '../services/universitiesService';

const SEARCH_DEBOUNCE_MS = 300;

interface UniversityPickerProps {
  label?: string;
  sheetTitle?: string;
  value: University[];
  maxSelection: number;
  helperText?: string;
  onChange: (universities: University[]) => void;
}

export const UniversityPicker = ({
  label,
  sheetTitle,
  value,
  maxSelection,
  helperText,
  onChange,
}: UniversityPickerProps) => {
  const toast = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pending, setPending] = useState<University[]>(value);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), SEARCH_DEBOUNCE_MS);
  const isSingle = maxSelection === 1;
  const canAddMore = value.length < maxSelection;

  const searchQuery = useQuery({
    queryKey: ['universities', debouncedKeyword],
    queryFn: ({ signal }) => universitiesService.search(debouncedKeyword, signal),
    enabled: isVisible,
    staleTime: 5 * 60 * 1000,
  });

  const open = () => {
    setPending(value);
    setKeyword('');
    setIsVisible(true);
  };

  const close = () => setIsVisible(false);

  const handleSelect = (university: University) => {
    if (isSingle) {
      onChange([university]);
      close();

      return;
    }

    const isSelected = pending.some((item) => item.code === university.code);

    if (isSelected) {
      setPending(pending.filter((item) => item.code !== university.code));

      return;
    }

    if (pending.length >= maxSelection) {
      toast.warning(`Chỉ chọn được tối đa ${maxSelection} trường`);

      return;
    }

    setPending([...pending, university]);
  };

  const handleRemove = (code: string) => onChange(value.filter((item) => item.code !== code));

  return (
    <View style={styles.container}>
      {label ? (
        <Typography variant="label" weight="MEDIUM" colorKey="TEXT_PRIMARY">
          {label}
        </Typography>
      ) : null}

      {value.map((university) => (
        <View key={university.code} style={styles.selectedRow}>
          <GraduationCap size={18} color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" weight="MEDIUM" style={styles.selectedName}>
            {university.name}
          </Typography>
          <TouchableOpacity
            onPress={() => handleRemove(university.code)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Bỏ ${university.name}`}
          >
            <X size={16} color={THEME_COLORS.TEXT_MUTED} />
          </TouchableOpacity>
        </View>
      ))}

      {canAddMore || isSingle ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={open}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Plus size={18} color={THEME_COLORS.PRIMARY} />
          <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY">
            {isSingle && value.length > 0
              ? 'Đổi trường'
              : value.length > 0
                ? `Thêm trường (${value.length}/${maxSelection})`
                : 'Chọn trường đại học'}
          </Typography>
        </TouchableOpacity>
      ) : null}

      {helperText ? (
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {helperText}
        </Typography>
      ) : null}

      <BottomSheet
        isVisible={isVisible}
        onClose={close}
        keyboardAvoiding
        sheetStyle={styles.sheet}
        handleStyle={styles.handle}
      >
        <Typography variant="h3" weight="BOLD">
          {sheetTitle ?? label ?? 'Chọn trường đại học'}
        </Typography>

        <Input
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Tìm theo tên hoặc mã trường"
          autoCorrect={false}
          leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          containerStyle={styles.searchInput}
        />

        {searchQuery.isLoading ? (
          <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loader} />
        ) : (
          <FlatList
            data={searchQuery.data ?? []}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = (isSingle ? value : pending).some(
                (selected) => selected.code === item.code
              );

              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.optionText}>
                    <Typography
                      variant="body2"
                      weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                      colorKey={isSelected ? 'PRIMARY' : 'TEXT_PRIMARY'}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" colorKey="TEXT_MUTED">
                      {item.code}
                    </Typography>
                  </View>
                  {isSelected ? <Check size={18} color={THEME_COLORS.PRIMARY} /> : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.empty}>
                {searchQuery.isError
                  ? 'Không tải được danh sách trường'
                  : 'Không tìm thấy trường phù hợp'}
              </Typography>
            }
          />
        )}

        {isSingle ? null : (
          <Button
            title={`Xong (${pending.length}/${maxSelection})`}
            fullWidth
            onPress={() => {
              onChange(pending);
              close();
            }}
          />
        )}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING_TOKENS.SM, marginBottom: SPACING_TOKENS.MD },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  selectedName: { flex: 1 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.XS,
    minHeight: 48,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  sheet: {
    maxHeight: '85%',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
  },
  handle: {
    marginBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.BORDER,
  },
  searchInput: { marginBottom: 0 },
  loader: { marginVertical: SPACING_TOKENS.XL },
  list: { maxHeight: 420 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  optionSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  optionText: { flex: 1, gap: 2 },
  empty: { paddingVertical: SPACING_TOKENS.LG },
});
