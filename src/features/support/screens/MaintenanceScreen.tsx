import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SvgXml } from 'react-native-svg';
import { Check, Heart, MessageSquare, type LucideIcon } from 'lucide-react-native';
import { HTTP_STATUS_CODES, useMaintenanceStore, type MaintenanceInfo } from '@core';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { Button, NoticeBanner, ScreenContainer, Typography } from '@ui';
import { SERVER_MAINTENANCE_SVG } from '../assets/serverMaintenanceSvg';
import { SectionLabel } from '../components';
import { supportService } from '../services';
import { formatExpectedEnd, formatIncidentTime } from '../utils';

export interface MaintenanceScreenProps {
  info: MaintenanceInfo;
  savedRoomCount?: number;
  onOpenSavedRooms?: () => void;
  onOpenMessages?: () => void;
}

interface WaitingAction {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
  onPress: () => void;
}

export const MaintenanceScreen = ({
  info,
  savedRoomCount,
  onOpenSavedRooms,
  onOpenMessages,
}: MaintenanceScreenProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const clearMaintenance = useMaintenanceStore((state) => state.clear);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => subscription.remove();
  }, []);

  const isPlannedMaintenance = info.statusCode === HTTP_STATUS_CODES.SERVICE_UNAVAILABLE;

  const waitingActions: WaitingAction[] = [];

  if (onOpenSavedRooms) {
    waitingActions.push({
      key: 'saved-rooms',
      label: savedRoomCount
        ? `Xem ${savedRoomCount} phòng đã lưu (đã tải sẵn trên máy)`
        : 'Xem lại các phòng đã lưu',
      icon: Heart,
      color: THEME_COLORS.ERROR,
      background: THEME_COLORS.ERROR_LIGHT,
      onPress: onOpenSavedRooms,
    });
  }

  if (onOpenMessages) {
    waitingActions.push({
      key: 'messages',
      label: 'Đọc lại lịch sử tin nhắn với chủ trọ',
      icon: MessageSquare,
      color: THEME_COLORS.PRIMARY_DARK,
      background: THEME_COLORS.PRIMARY_LIGHT,
      onPress: onOpenMessages,
    });
  }

  const handleRetry = async () => {
    setIsRetrying(true);

    const isHealthy = await supportService.isServerHealthy();

    setIsRetrying(false);

    if (!isHealthy) {
      toast.warning('Hệ thống vẫn chưa sẵn sàng, vui lòng thử lại sau ít phút');

      return;
    }

    clearMaintenance();
    void queryClient.refetchQueries({ predicate: (query) => query.state.status === 'error' });
  };

  return (
    <ScreenContainer keyboardAvoiding={false} style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustration}>
          <SvgXml xml={SERVER_MAINTENANCE_SVG} width={66} height={66} />
        </View>

        <Typography variant="h1" weight="BOLD" align="center" style={styles.title}>
          {isPlannedMaintenance ? 'Hệ thống đang bảo trì' : 'Máy chủ đang gặp sự cố'}
        </Typography>

        <Typography colorKey="TEXT_SECONDARY" align="center" style={styles.description}>
          {isPlannedMaintenance ? 'UniNest đang được nâng cấp.' : 'Chúng tôi đang khắc phục sự cố.'}
          {info.expectedEndAt ? (
            <>
              {' Dự kiến xong lúc '}
              <Text style={styles.descriptionStrong}>{formatExpectedEnd(info.expectedEndAt)}</Text>.
            </>
          ) : (
            ' Vui lòng quay lại sau ít phút.'
          )}
        </Typography>

        {waitingActions.length > 0 ? (
          <View style={styles.waitingCard}>
            <SectionLabel>Trong lúc chờ, bạn vẫn có thể</SectionLabel>
            <View style={styles.waitingDivider} />
            {waitingActions.map(({ key, label, icon: Icon, color, background, onPress }) => (
              <TouchableOpacity
                key={key}
                style={styles.waitingRow}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <View style={[styles.waitingIcon, { backgroundColor: background }]}>
                  <Icon size={18} color={color} />
                </View>
                <Typography
                  variant="label"
                  weight="REGULAR"
                  colorKey="TEXT_SECONDARY"
                  style={styles.waitingLabel}
                >
                  {label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <NoticeBanner tone="success" icon={Check} style={styles.notice}>
          Lịch hẹn và giao dịch của bạn không bị ảnh hưởng. Chủ trọ vẫn nhận được yêu cầu đã gửi
          trước đó.
        </NoticeBanner>

        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          align="center"
          style={styles.incident}
        >
          {`Mã sự cố: SRV-${info.statusCode} · ${formatIncidentTime(info.detectedAt)}`}
        </Typography>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Thử lại"
          size="lg"
          fullWidth
          isLoading={isRetrying}
          onPress={() => void handleRetry()}
        />
        {onOpenSavedRooms ? (
          <Button
            title="Xem phòng đã lưu"
            variant="outline"
            size="lg"
            fullWidth
            onPress={onOpenSavedRooms}
            textStyle={styles.secondaryButtonText}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 92,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
  },
  illustration: {
    alignSelf: 'center',
    width: 132,
    height: 132,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  title: {
    marginTop: SPACING_TOKENS.LG,
    letterSpacing: -0.5,
  },
  description: {
    marginTop: SPACING_TOKENS.SM,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  descriptionStrong: {
    fontWeight: TYPOGRAPHY_TOKENS.FONT_WEIGHTS.SEMIBOLD,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  waitingCard: {
    marginTop: SPACING_TOKENS.LG,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  waitingDivider: {
    height: 1,
    marginTop: 12,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  waitingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingLabel: {
    flex: 1,
  },
  notice: {
    marginTop: SPACING_TOKENS.LG,
  },
  incident: {
    marginTop: SPACING_TOKENS.LG,
    letterSpacing: 0.2,
  },
  footer: {
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  secondaryButtonText: {
    color: THEME_COLORS.TEXT_SECONDARY,
  },
});
