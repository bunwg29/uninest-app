import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { HelpArticle } from '../types';

interface HelpArticleItemProps {
  article: HelpArticle;
  isExpanded: boolean;
  hasDivider: boolean;
  onToggle: (id: string) => void;
}

export const HelpArticleItem = memo(
  ({ article, isExpanded, hasDivider, onToggle }: HelpArticleItemProps) => {
    const Chevron = isExpanded ? ChevronUp : ChevronDown;

    return (
      <Pressable
        style={[styles.item, hasDivider && styles.divider, isExpanded && styles.itemExpanded]}
        onPress={() => onToggle(article.id)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.questionRow}>
          <Typography weight={isExpanded ? 'SEMIBOLD' : 'REGULAR'} style={styles.question}>
            {article.question}
          </Typography>
          <Chevron
            size={18}
            color={isExpanded ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
            style={!isExpanded && styles.chevronCollapsed}
          />
        </View>

        {isExpanded ? (
          <Typography variant="label" weight="REGULAR" colorKey="TEXT_MUTED" style={styles.answer}>
            {article.answer}
          </Typography>
        ) : null}
      </Pressable>
    );
  }
);

HelpArticleItem.displayName = 'HelpArticleItem';

const styles = StyleSheet.create({
  item: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM - 2,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  itemExpanded: {
    justifyContent: 'flex-start',
    paddingTop: SPACING_TOKENS.SM - 1,
    paddingBottom: 18,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.MD,
  },
  question: {
    flex: 1,
  },
  chevronCollapsed: {
    alignSelf: 'center',
  },
  answer: {
    marginTop: 7,
  },
});
