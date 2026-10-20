import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SearchX, Sparkles, WifiOff } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';

export interface RelaxSuggestion {
  key: string;
  label: string;
  onPress: () => void;
}

interface SearchEmptyViewProps {
  criteriaCount: number;
  description: string;
  suggestions: RelaxSuggestion[];
  actionTitle: string;
  onAction: () => void;
  onOpenAssistant: () => void;
}

export const SearchEmptyView = ({
  criteriaCount,
  description,
  suggestions,
  actionTitle,
  onAction,
  onOpenAssistant,
}: SearchEmptyViewProps) => (
  <View style={styles.flex}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.iconCircle}>
        <SearchX size={72} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      </View>

      <Typography variant="h3" weight="SEMIBOLD" align="center" style={styles.title}>
        {criteriaCount > 1
          ? `Không có phòng nào khớp cả ${criteriaCount} tiêu chí`
          : 'Không tìm thấy phòng phù hợp'}
      </Typography>
      <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
        {description}
      </Typography>

      {suggestions.length > 0 ? (
        <>
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            align="center"
            style={styles.suggestionTitle}
          >
            THỬ NỚI LỎNG MỘT TIÊU CHÍ
          </Typography>
          <View style={styles.suggestionRow}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.key}
                style={styles.suggestionChip}
                onPress={suggestion.onPress}
                accessibilityRole="button"
              >
                <Typography variant="body2" weight="MEDIUM" colorKey="TEXT_SECONDARY">
                  {suggestion.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={styles.infoBox}
        onPress={onOpenAssistant}
        accessibilityRole="button"
        accessibilityLabel="Mô tả nhu cầu cho trợ lý AI"
      >
        <Sparkles size={18} color={THEME_COLORS.PRIMARY} />
        <Typography variant="label" colorKey="PRIMARY_DARK" style={styles.infoText}>
          Hoặc mô tả nhu cầu cho trợ lý AI, nó sẽ tự tìm phương án gần đúng nhất.
        </Typography>
      </TouchableOpacity>
    </ScrollView>

    <View style={styles.footer}>
      <Button title={actionTitle} size="lg" onPress={onAction} />
    </View>
  </View>
);

interface SearchErrorViewProps {
  isNetworkError: boolean;
  onRetry: () => void;
  onOpenSaved: () => void;
}

export const SearchErrorView = ({ isNetworkError, onRetry, onOpenSaved }: SearchErrorViewProps) => (
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={[styles.iconCircle, styles.errorCircle]}>
      <WifiOff size={72} color={THEME_COLORS.ERROR} />
    </View>

    <Typography variant="h3" weight="SEMIBOLD" align="center" style={styles.title}>
      {isNetworkError ? 'Không có kết nối mạng' : 'Không thể tải danh sách phòng'}
    </Typography>
    <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
      {isNetworkError
        ? 'Kiểm tra lại Wi-Fi hoặc dữ liệu di động rồi thử lại.'
        : 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.'}
    </Typography>

    <View style={styles.errorActions}>
      <Button title="Thử lại" size="lg" onPress={onRetry} />
      <Button
        title="Xem phòng đã lưu"
        size="lg"
        variant="outline"
        onPress={onOpenSaved}
        style={styles.outlinedAction}
        textStyle={styles.outlinedActionText}
      />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 36, paddingBottom: 24 },
  iconCircle: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  errorCircle: { backgroundColor: THEME_COLORS.ERROR_LIGHT },
  title: { marginTop: 24, fontSize: 20, lineHeight: 28, letterSpacing: -0.3 },
  description: { maxWidth: 330, marginTop: 8, lineHeight: 22 },
  suggestionTitle: { marginTop: 24, letterSpacing: 0.2 },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  suggestionChip: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  infoBox: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  infoText: { flex: 1, lineHeight: 20 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  errorActions: { alignSelf: 'stretch', gap: 12, marginTop: 24 },
  outlinedAction: { borderColor: THEME_COLORS.PRIMARY, backgroundColor: THEME_COLORS.SURFACE },
  outlinedActionText: { color: THEME_COLORS.PRIMARY_DARK },
});
