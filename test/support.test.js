import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { useMaintenanceStore } from '../src/core/store/maintenanceStore';
import { removeDiacritics } from '../src/core/utils/format';
import { HELP_ARTICLES, HELP_TOPICS } from '../src/features/support/constants/help';
import { LEGAL_DOCUMENTS, LEGAL_TABS } from '../src/features/support/constants/legal';
import { HelpArticleItem } from '../src/features/support/components/HelpArticleItem';
import { formatExpectedEnd, formatIncidentTime } from '../src/features/support/utils';

afterEach(() => {
  cleanup();
  useMaintenanceStore.getState().clear();
  jest.useRealTimers();
});

describe('maintenance store', () => {
  it('keeps the first detection time while the incident is ongoing', () => {
    const { report } = useMaintenanceStore.getState();

    report({ statusCode: 503, detectedAt: 1000, expectedEndAt: 5000 });
    report({ statusCode: 502, detectedAt: 2000, expectedEndAt: null });

    expect(useMaintenanceStore.getState().info).toEqual({
      statusCode: 502,
      detectedAt: 1000,
      expectedEndAt: 5000,
    });
  });

  it('ignores reports while snoozed and resumes after clear', () => {
    const { report, snooze, clear } = useMaintenanceStore.getState();

    snooze(60_000);
    report({ statusCode: 503, detectedAt: Date.now(), expectedEndAt: null });
    expect(useMaintenanceStore.getState().info).toBeNull();

    clear();
    report({ statusCode: 503, detectedAt: Date.now(), expectedEndAt: null });
    expect(useMaintenanceStore.getState().info?.statusCode).toBe(503);
  });
});

describe('support formatting', () => {
  const now = new Date(2026, 8, 7, 9, 41);

  it('describes the expected end relative to today', () => {
    expect(formatExpectedEnd(new Date(2026, 8, 7, 10, 30).getTime(), now)).toBe('10:30 hôm nay');
    expect(formatExpectedEnd(new Date(2026, 8, 8, 8, 5).getTime(), now)).toBe('08:05 ngày mai');
    expect(formatExpectedEnd(new Date(2026, 8, 12, 14, 0).getTime(), now)).toBe('14:00 12/09/2026');
  });

  it('formats the incident timestamp', () => {
    expect(formatIncidentTime(now.getTime())).toBe('07/09/2026 09:41');
  });

  it('removes Vietnamese diacritics including uppercase Đ', () => {
    expect(removeDiacritics('Đặt CỌC & Thanh toán')).toBe('dat coc & thanh toan');
  });
});

describe('support content', () => {
  it('has unique article ids that all belong to a known topic', () => {
    const ids = HELP_ARTICLES.map((article) => article.id);
    const topicIds = new Set(HELP_TOPICS.map((topic) => topic.id));

    expect(new Set(ids).size).toBe(ids.length);
    HELP_ARTICLES.forEach((article) => expect(topicIds.has(article.topicId)).toBe(true));
    HELP_TOPICS.forEach((topic) =>
      expect(HELP_ARTICLES.some((article) => article.topicId === topic.id)).toBe(true)
    );
  });

  it('features the five frequently asked questions', () => {
    expect(HELP_ARTICLES.filter((article) => article.isFeatured)).toHaveLength(5);
  });

  it('provides a summary and sections for every legal tab', () => {
    LEGAL_TABS.forEach((tab) => {
      expect(LEGAL_DOCUMENTS[tab].summary).toBeTruthy();
      expect(LEGAL_DOCUMENTS[tab].sections.length).toBeGreaterThan(0);
    });
  });
});

describe('HelpArticleItem', () => {
  const article = HELP_ARTICLES[0];

  it('shows the answer only when expanded and reports toggles', async () => {
    const onToggle = jest.fn();
    const screen = await render(
      <HelpArticleItem article={article} isExpanded={false} hasDivider onToggle={onToggle} />
    );

    expect(screen.queryByText(article.answer)).toBeNull();

    await fireEvent.press(screen.getByText(article.question));
    expect(onToggle).toHaveBeenCalledWith(article.id);

    await screen.rerender(
      <HelpArticleItem article={article} isExpanded hasDivider onToggle={onToggle} />
    );
    expect(screen.getByText(article.answer)).toBeTruthy();
  });
});
