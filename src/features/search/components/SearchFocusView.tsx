import { useEffect, useRef } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputInstance,
} from 'react-native';
import { Clock3, GraduationCap, Search, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { SearchSchool } from '../types';

interface SearchFocusViewProps {
  keyword: string;
  recentTerms: string[];
  schoolSuggestions: SearchSchool[];
  onChangeKeyword: (keyword: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onSelectRecent: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  onSelectSchool: (school: SearchSchool) => void;
}

export const SearchFocusView = ({
  keyword,
  recentTerms,
  schoolSuggestions,
  onChangeKeyword,
  onSubmit,
  onCancel,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
  onSelectSchool,
}: SearchFocusViewProps) => {
  const inputRef = useRef<TextInputInstance>(null);
  const trimmedKeyword = keyword.trim();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.field}>
          <Search size={20} color={THEME_COLORS.PRIMARY} />
          <TextInput
            ref={inputRef}
            value={keyword}
            onChangeText={onChangeKeyword}
            onSubmitEditing={onSubmit}
            placeholder="Tìm theo khu vực, tên đường…"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            returnKeyType="search"
            autoCapitalize="none"
            selectionColor={THEME_COLORS.PRIMARY}
            accessibilityLabel="Từ khóa tìm phòng"
            style={styles.input}
          />
          {keyword.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onChangeKeyword('')}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Xóa từ khóa tìm kiếm"
            >
              <X size={12} color={THEME_COLORS.WHITE} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            onCancel();
          }}
          accessibilityRole="button"
          accessibilityLabel="Huỷ tìm kiếm"
        >
          <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
            Huỷ
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {recentTerms.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <Typography variant="body2" weight="SEMIBOLD">
                Tìm kiếm gần đây
              </Typography>
              <TouchableOpacity
                onPress={onClearRecent}
                accessibilityRole="button"
                accessibilityLabel="Xoá hết lịch sử tìm kiếm"
              >
                <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                  Xoá hết
                </Typography>
              </TouchableOpacity>
            </View>

            {recentTerms.map((term) => (
              <View key={term} style={styles.row}>
                <TouchableOpacity
                  style={styles.rowMain}
                  onPress={() => onSelectRecent(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Tìm lại ${term}`}
                >
                  <Clock3 size={19} color={THEME_COLORS.TEXT_PLACEHOLDER} />
                  <Typography variant="body2" numberOfLines={1} style={styles.rowTitle}>
                    {term}
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onRemoveRecent(term)}
                  hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá ${term} khỏi lịch sử`}
                >
                  <X size={17} color={THEME_COLORS.TEXT_PLACEHOLDER} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {trimmedKeyword && schoolSuggestions.length > 0 ? (
          <View>
            <Typography variant="body2" weight="SEMIBOLD" style={styles.suggestionHeader}>
              {`Gợi ý khớp "${trimmedKeyword}"`}
            </Typography>

            {schoolSuggestions.map((school) => (
              <TouchableOpacity
                key={school.id}
                style={styles.suggestionRow}
                onPress={() => onSelectSchool(school)}
                accessibilityRole="button"
                accessibilityLabel={`Chọn trường ${school.name}`}
              >
                <GraduationCap size={19} color={THEME_COLORS.TEXT_SECONDARY} />
                <View style={styles.rowTitle}>
                  <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
                    {school.name}
                  </Typography>
                  {school.address ? (
                    <Typography
                      variant="caption"
                      weight="MEDIUM"
                      colorKey="TEXT_PLACEHOLDER"
                      numberOfLines={1}
                    >
                      {`Trường · ${school.address}`}
                    </Typography>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  field: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TEXT_PLACEHOLDER,
  },
  content: { paddingBottom: 24 },
  sectionHeader: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  rowMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { flex: 1, minWidth: 0 },
  suggestionHeader: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 10 },
  suggestionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
