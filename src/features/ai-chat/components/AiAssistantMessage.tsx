import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ArrowRight, CircleAlert, Search } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import type { AiAssistantContent, AiRelaxationSuggestion } from '../types';
import { formatAiTime } from '../utils';
import { AiCriteriaChips } from './AiCriteriaChips';
import { AiListingCard } from './AiListingCard';
import { AiAssistantFrame } from './AiMessageBubbles';

interface AiAssistantMessageProps {
  content: AiAssistantContent;
  canEditCriteria: boolean;
  onEditCriteria: () => void;
  onOpenListing: (listingId: string) => void;
  onApplySuggestion: (suggestion: AiRelaxationSuggestion) => void;
  onUseSearch: (content: AiAssistantContent) => void;
  onRetry: (content: AiAssistantContent) => void;
}

const SectionLabel = ({ children }: { children: string }) => (
  <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER" style={styles.label}>
    {children}
  </Typography>
);

export const AiAssistantMessage = ({
  content,
  canEditCriteria,
  onEditCriteria,
  onOpenListing,
  onApplySuggestion,
  onUseSearch,
  onRetry,
}: AiAssistantMessageProps) => {
  const labels = content.criteriaDisplay?.labels ?? [];

  if (content.type === 'service_error') {
    return (
      <View>
        <AiAssistantFrame isError>
          <View style={styles.noticeRow}>
            <AlertCircle size={18} color={THEME_COLORS.ERROR} />

            <Typography variant="body2" colorKey="TEXT_PRIMARY" style={styles.flexText}>
              {content.answer}
            </Typography>
          </View>

          {labels.length > 0 ? (
            <View style={styles.section}>
              <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
                Mình đã điền sẵn bộ lọc theo mô tả của bạn:
              </Typography>

              <AiCriteriaChips labels={labels} />
            </View>
          ) : null}

          <Button
            title="Dùng tìm kiếm thường"
            leftIcon={<Search size={18} color={THEME_COLORS.WHITE} />}
            onPress={() => onUseSearch(content)}
            fullWidth
          />

          {content.retryPayload ? (
            <Button
              title="Thử hỏi lại"
              variant="outline"
              onPress={() => onRetry(content)}
              fullWidth
            />
          ) : null}
        </AiAssistantFrame>

        <Typography
          variant="caption"
          colorKey="TEXT_PLACEHOLDER"
          align="center"
          style={styles.errorCode}
        >
          {`Mã lỗi: ${content.errorCode ?? 'AI-503'} · ${formatAiTime(content.createdAt)}`}
        </Typography>
      </View>
    );
  }

  if (content.type === 'no_results') {
    return (
      <AiAssistantFrame>
        <View style={styles.noticeRow}>
          <CircleAlert size={18} color={THEME_COLORS.WARNING} />

          <Typography variant="body2" colorKey="TEXT_PRIMARY" style={styles.flexText}>
            {content.answer}
          </Typography>
        </View>

        {labels.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <SectionLabel>MÌNH ĐÃ TÌM VỚI</SectionLabel>

              {canEditCriteria ? <EditLink onPress={onEditCriteria} /> : null}
            </View>

            <AiCriteriaChips labels={labels} />
          </View>
        ) : null}

        {content.totalActiveCount !== null ? (
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            {`Kết quả: 0 / ${content.totalActiveCount} tin đăng đang hiển thị`}
          </Typography>
        ) : null}

        {content.suggestions.length > 0 ? (
          <View style={[styles.section, styles.divided]}>
            <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              {content.suggestions.length > 1
                ? 'Thử một trong hai hướng này?'
                : 'Thử hướng này nhé?'}
            </Typography>

            {content.suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.title}
                style={styles.suggestion}
                onPress={() => onApplySuggestion(suggestion)}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <View style={styles.suggestionIcon}>
                  <ArrowRight size={16} color={THEME_COLORS.PRIMARY_DARK} />
                </View>

                <View style={styles.flexText}>
                  <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
                    {suggestion.title}
                  </Typography>

                  <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                    {suggestion.description}
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}

            <Typography variant="label" colorKey="TEXT_MUTED">
              Mình tìm lại theo hướng nào?
            </Typography>
          </View>
        ) : null}
      </AiAssistantFrame>
    );
  }

  return (
    <AiAssistantFrame>
      {labels.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <SectionLabel>TIÊU CHÍ ĐÃ HIỂU</SectionLabel>

            {canEditCriteria ? <EditLink onPress={onEditCriteria} /> : null}
          </View>

          <AiCriteriaChips labels={labels} />
        </View>
      ) : null}

      <Typography variant="body2" colorKey="TEXT_PRIMARY" style={styles.answer}>
        {content.answer}
      </Typography>

      {content.listings.length > 0 ? (
        <View style={styles.listings}>
          {content.listings.map((listing, index) => (
            <AiListingCard
              key={listing.id}
              index={index + 1}
              listing={listing}
              onPress={() => onOpenListing(listing.id)}
            />
          ))}
        </View>
      ) : null}
    </AiAssistantFrame>
  );
};

const EditLink = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    accessibilityRole="button"
    accessibilityLabel="Sửa tiêu chí"
  >
    <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
      Sửa
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  label: {
    letterSpacing: 0.2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    gap: SPACING_TOKENS.SM,
  },
  divided: {
    paddingTop: SPACING_TOKENS.SM + 4,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM + 2,
  },
  flexText: {
    flex: 1,
    lineHeight: 21,
  },
  answer: {
    lineHeight: 21,
  },
  listings: {
    gap: SPACING_TOKENS.SM,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    padding: SPACING_TOKENS.SM + 4,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCode: {
    marginTop: SPACING_TOKENS.MD,
  },
});
