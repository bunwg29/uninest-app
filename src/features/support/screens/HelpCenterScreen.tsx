import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, TriangleAlert } from 'lucide-react-native';
import { removeDiacritics } from '@core';
import { useToast } from '@hooks';
import { SPACING_TOKENS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { EmptyState, HeaderBar, Input, NoticeBanner, ScreenContainer } from '@ui';
import type { RootStackParamList } from '@navigation';
import { HelpArticleItem, HelpTopicRow, SectionLabel } from '../components';
import { HELP_ARTICLES, HELP_TOPICS, SCAM_REPORT_SUBJECT, SUPPORT_EMAIL } from '../constants';
import type { HelpArticle } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HelpCenter'>;
type HelpCenterRouteProp = RouteProp<RootStackParamList, 'HelpCenter'>;

const SEARCH_INDEX = HELP_ARTICLES.map((article) => ({
  article,
  text: removeDiacritics(`${article.question} ${article.answer}`),
}));

const FEATURED_ARTICLES = HELP_ARTICLES.filter((article) => article.isFeatured);

const ARTICLE_COUNT_BY_TOPIC = HELP_ARTICLES.reduce<Record<string, number>>((counts, article) => {
  counts[article.topicId] = (counts[article.topicId] ?? 0) + 1;

  return counts;
}, {});

export const HelpCenterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HelpCenterRouteProp>();
  const toast = useToast();
  const topicId = route.params?.topicId;
  const topic = topicId ? HELP_TOPICS.find((item) => item.id === topicId) : undefined;

  const baseArticles = useMemo(
    () =>
      topicId ? HELP_ARTICLES.filter((article) => article.topicId === topicId) : FEATURED_ARTICLES,
    [topicId]
  );

  const [keyword, setKeyword] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(baseArticles[0]?.id ?? null);

  const normalizedKeyword = removeDiacritics(keyword.trim());
  const isSearching = normalizedKeyword.length > 0;

  const articles = useMemo<HelpArticle[]>(() => {
    if (!normalizedKeyword) return baseArticles;

    return SEARCH_INDEX.filter(
      ({ article, text }) =>
        (!topicId || article.topicId === topicId) && text.includes(normalizedKeyword)
    ).map(({ article }) => article);
  }, [baseArticles, normalizedKeyword, topicId]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const handleReportScam = () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SCAM_REPORT_SUBJECT)}`;

    Linking.openURL(url).catch(() => {
      toast.info(`Gửi báo cáo tới ${SUPPORT_EMAIL}`);
    });
  };

  const listTitle = isSearching
    ? 'Kết quả tìm kiếm'
    : topic
      ? 'Các bài viết'
      : 'Câu hỏi thường gặp';

  return (
    <ScreenContainer style={styles.container}>
      <HeaderBar
        title={topic?.label ?? 'Trung tâm trợ giúp'}
        alignTitle="left"
        hasBottomBorder={false}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchArea}>
        <Input
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Tìm câu hỏi…"
          clearable
          returnKeyType="search"
          idleBorderColor={THEME_COLORS.SURFACE_MUTED}
          leftIcon={<Search size={19} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          containerStyle={styles.searchField}
          inputContainerStyle={styles.searchInput}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.notice}
          onPress={handleReportScam}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <NoticeBanner tone="error" icon={TriangleAlert}>
            <Text style={styles.noticeStrong}>Nghi ngờ bị lừa đảo?</Text>
            {' Báo cáo ngay — chúng tôi xử lý trong 24 giờ.'}
          </NoticeBanner>
        </TouchableOpacity>

        <SectionLabel style={styles.sectionLabel}>{listTitle}</SectionLabel>

        {articles.length > 0 ? (
          articles.map((article, index) => (
            <HelpArticleItem
              key={article.id}
              article={article}
              isExpanded={expandedId === article.id}
              hasDivider={index > 0}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <EmptyState
            title="Không tìm thấy câu hỏi phù hợp"
            description={`Thử từ khoá khác hoặc gửi câu hỏi tới ${SUPPORT_EMAIL}.`}
            icon={<Search size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          />
        )}

        {!topic && !isSearching ? (
          <>
            <SectionLabel style={styles.sectionLabel}>Theo chủ đề</SectionLabel>
            {HELP_TOPICS.map((item, index) => (
              <HelpTopicRow
                key={item.id}
                topic={item}
                articleCount={ARTICLE_COUNT_BY_TOPIC[item.id] ?? 0}
                hasDivider={index > 0}
                onPress={() => navigation.push('HelpCenter', { topicId: item.id })}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchArea: {
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchField: {
    marginBottom: SPACING_TOKENS.MD,
  },
  searchInput: {
    height: 46,
    paddingHorizontal: 12,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  scroll: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  content: {
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  notice: {
    marginHorizontal: SPACING_TOKENS.MD,
  },
  noticeStrong: {
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: SPACING_TOKENS.SM,
    marginHorizontal: SPACING_TOKENS.MD,
  },
});
