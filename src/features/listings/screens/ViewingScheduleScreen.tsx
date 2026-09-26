import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarDays } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Button, Typography, HeaderBar, ScreenContainer } from '@ui';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { LISTING_FORM_STEPS, DAYS_OF_WEEK, VIEWING_SLOT_LABELS } from '../types/constants';
import type { DayKey, ViewingSchedule, ViewingSlot } from '../types';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const TOTAL_STEPS = LISTING_FORM_STEPS.length;

type SlotKey = keyof ViewingSlot;

export const ViewingScheduleScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { viewingSchedule, setViewingSchedule, step1, editingListingId } = useListingPostStore();
  const [isOnlineHoldEnabled, setIsOnlineHoldEnabled] = useState(true);

  const handleToggleSlot = useCallback(
    (day: DayKey, slot: SlotKey) => {
      const updated: ViewingSchedule = {
        ...viewingSchedule,
        [day]: {
          ...viewingSchedule[day],
          [slot]: !viewingSchedule[day][slot],
        },
      };

      setViewingSchedule(updated);
    },
    [viewingSchedule, setViewingSchedule]
  );

  const handleContinue = useCallback(() => {
    navigation.navigate('ListingPostPreview');
  }, [navigation]);

  const totalSelected = Object.values(viewingSchedule).reduce(
    (total, daySlots) => total + Object.values(daySlots).filter(Boolean).length,
    0
  );

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <HeaderBar
        title={editingListingId ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
        onBack={() => navigation.goBack()}
        subtitle={`Bước 5 / ${TOTAL_STEPS}: Lịch xem phòng`}
        alignTitle="left"
      />

      <StepIndicator currentStep={5} totalSteps={TOTAL_STEPS} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <CalendarDays size={20} color={THEME_COLORS.PRIMARY} />

          <View style={styles.headerText}>
            <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Lịch xem phòng
            </Typography>

            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              Chọn các khung giờ bạn sẵn sàng cho sinh viên đến xem phòng
            </Typography>
          </View>
        </View>

        {totalSelected > 0 ? (
          <View style={styles.selectedBadge}>
            <Typography variant="caption" colorKey="PRIMARY">
              Đã chọn {totalSelected} khung giờ
            </Typography>
          </View>
        ) : null}

        <View style={styles.scheduleGrid}>
          <View style={styles.gridHeader}>
            <View style={styles.dayLabelCell} />

            {VIEWING_SLOT_LABELS.map((slot) => (
              <View key={slot.key} style={styles.slotHeaderCell}>
                <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_SECONDARY">
                  {slot.label}
                </Typography>
              </View>
            ))}
          </View>

          {DAYS_OF_WEEK.map(({ key: dayKey, label: dayLabel }) => (
            <View key={dayKey} style={styles.gridRow}>
              <View style={styles.dayLabelCell}>
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PRIMARY">
                  {dayLabel}
                </Typography>
              </View>

              {VIEWING_SLOT_LABELS.map((slot) => {
                const isActive = viewingSchedule[dayKey][slot.key as SlotKey];

                return (
                  <TouchableOpacity
                    key={slot.key}
                    style={[styles.slotCell, isActive && styles.slotCellActive]}
                    onPress={() => handleToggleSlot(dayKey, slot.key as SlotKey)}
                    activeOpacity={0.7}
                  >
                    {isActive ? <View style={styles.slotDot} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.scheduleHint}>
          Sáng 8–11h · Chiều 14–17h · Tối 18:30–20:30
        </Typography>

        <View style={styles.holdRow}>
          <View style={styles.holdCopy}>
            <Typography variant="body2" weight="BOLD">
              Cho phép giữ chỗ online
            </Typography>
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
              Sinh viên chỉ đặt được khi cọc qua UniNest
            </Typography>
          </View>
          <Switch
            value={isOnlineHoldEnabled}
            onValueChange={setIsOnlineHoldEnabled}
            trackColor={{ false: THEME_COLORS.BORDER, true: THEME_COLORS.PRIMARY_LIGHT }}
            thumbColor={isOnlineHoldEnabled ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
          />
        </View>

        {isOnlineHoldEnabled ? (
          <View style={styles.depositField}>
            <Typography variant="label" weight="BOLD">
              Số tiền cọc
            </Typography>
            <View style={styles.depositValue}>
              <Typography variant="body1">
                {Number(step1.deposit || 2500000).toLocaleString('vi-VN')}
              </Typography>
              <Typography variant="body2" colorKey="TEXT_PLACEHOLDER">
                đ
              </Typography>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button variant="primary" size="lg" fullWidth onPress={handleContinue}>
          Xem trước
        </Button>
      </View>
    </ScreenContainer>
  );
};

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = currentStep / totalSteps;

  return (
    <View style={indicatorStyles.container}>
      <View style={indicatorStyles.track}>
        <View style={[indicatorStyles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const indicatorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  track: {
    height: 4,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  selectedBadge: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING_TOKENS.MD,
  },
  scheduleGrid: {
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.MD,
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  dayLabelCell: {
    width: 40,
    paddingVertical: SPACING_TOKENS.SM,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME_COLORS.BORDER,
  },
  slotHeaderCell: {
    flex: 1,
    paddingVertical: SPACING_TOKENS.SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCell: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: THEME_COLORS.BORDER,
  },
  slotCellActive: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  slotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  noteBanner: {
    padding: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  scheduleHint: { marginBottom: SPACING_TOKENS.SM },
  holdRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING_TOKENS.SM },
  holdCopy: { flex: 1 },
  depositField: { marginTop: SPACING_TOKENS.MD },
  depositValue: {
    height: 52,
    paddingHorizontal: SPACING_TOKENS.MD,
    marginTop: 6,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
