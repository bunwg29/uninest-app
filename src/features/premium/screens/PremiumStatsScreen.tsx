import { useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { HeaderBar, ScreenContainer, Typography } from '@ui';
import {
  PremiumError,
  PremiumLocked,
  PremiumSkeleton,
  PremiumSourceBars,
  PremiumViewsChart,
} from '../components';
import { usePremiumStats, usePremiumStatus } from '../hooks';
import { PREMIUM_STATS_PERIOD_OPTIONS, type PremiumStatsPeriod } from '../types';
import { formatPercent } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PremiumStats'>;

interface SummaryCardProps {
  label: string;
  value: string;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <View style={styles.summaryCard}>
    <Typography variant="caption" colorKey="TEXT_MUTED" align="center">
      {label}
    </Typography>
    <Typography variant="h3" weight="BOLD" colorKey="PRIMARY_DARK" align="center">
      {value}
    </Typography>
  </View>
);

export const PremiumStatsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [period, setPeriod] = useState<PremiumStatsPeriod>('30d');
  const statusQuery = usePremiumStatus();
  const isPremium = statusQuery.data?.isPremium === true;
  const statsQuery = usePremiumStats(period, isPremium);
  const stats = statsQuery.data;

  const refresh = () => {
    void Promise.all([statusQuery.refetch(), isPremium ? statsQuery.refetch() : null]);
  };

  const renderContent = () => {
    if (statusQuery.isLoading) return <PremiumSkeleton />;

    if (statusQuery.isError) return <PremiumError onRetry={refresh} />;

    if (!isPremium) {
      return <PremiumLocked onUpgrade={() => navigation.replace('PremiumUpgrade')} />;
    }

    if (statsQuery.isLoading) return <PremiumSkeleton />;

    if (statsQuery.isError || !stats) return <PremiumError onRetry={refresh} />;

    return (
      <View style={styles.content}>
        <View style={styles.periodRow}>
          {PREMIUM_STATS_PERIOD_OPTIONS.map((option) => {
            const isSelected = option.value === period;

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.periodPill, isSelected && styles.periodPillSelected]}
                onPress={() => setPeriod(option.value)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Typography
                  variant="caption"
                  weight={isSelected ? 'BOLD' : 'MEDIUM'}
                  color={isSelected ? THEME_COLORS.WHITE : THEME_COLORS.TEXT_SECONDARY}
                >
                  {option.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Lượt xem" value={stats.totalViews.toLocaleString('vi-VN')} />
          <SummaryCard label="Lượt liên hệ" value={stats.totalContacts.toLocaleString('vi-VN')} />
          <SummaryCard label="Tỉ lệ chuyển đổi" value={formatPercent(stats.conversionRate)} />
        </View>

        <PremiumViewsChart daily={stats.daily} />

        <PremiumSourceBars sources={stats.sources} totalViews={stats.totalViews} />

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" align="center">
          Tỉ lệ chuyển đổi = lượt liên hệ (tin nhắn mới và yêu cầu xem phòng) / lượt xem.
        </Typography>
      </View>
    );
  };

  return (
    <ScreenContainer
      scrollable
      padding="none"
      contentContainerStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={statusQuery.isRefetching || statsQuery.isRefetching}
          onRefresh={refresh}
        />
      }
    >
      <HeaderBar title="Thống kê nâng cao" onBack={navigation.goBack} />

      {renderContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: { paddingBottom: SPACING_TOKENS.XL },
  content: { gap: SPACING_TOKENS.MD, padding: SPACING_TOKENS.MD },
  periodRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  periodPill: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  periodPillSelected: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  summaryRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  summaryCard: {
    flex: 1,
    gap: SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
