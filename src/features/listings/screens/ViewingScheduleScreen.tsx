import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, Typography, ScreenContainer } from '@ui';
import type { ListingPostStackParamList } from '@navigation';
import { useListingPostStore } from '../store/listingPostStore';
import { DAYS_OF_WEEK, VIEWING_SLOT_LABELS } from '../types/constants';
import { WizardHeader } from '../components/landlord/WizardHeader';
import type { DayKey, ViewingSchedule, ViewingSlot } from '../types';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

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

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <WizardHeader step={5} isEditing={Boolean(editingListingId)} onBack={navigation.goBack} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Typography variant="h2" weight="BOLD" style={styles.title}>
            Khi nào bạn rảnh cho xem phòng?
          </Typography>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.subtitle}>
            Sinh viên chỉ đặt được vào các khung giờ bạn bật ở đây.
          </Typography>
        </View>

        <View style={styles.scheduleCard}>
          {DAYS_OF_WEEK.map(({ key: dayKey, label: dayLabel }, index) => (
            <View key={dayKey} style={[styles.dayRow, index > 0 && styles.dayRowDivider]}>
              <Typography
                variant="body2"
                weight="BOLD"
                colorKey="TEXT_PRIMARY"
                style={styles.dayLabel}
              >
                {dayLabel}
              </Typography>

              <View style={styles.slotRow}>
                {VIEWING_SLOT_LABELS.map((slot) => {
                  const isActive = viewingSchedule[dayKey][slot.key as SlotKey];

                  return (
                    <TouchableOpacity
                      key={slot.key}
                      style={[styles.slotChip, isActive && styles.slotChipActive]}
                      onPress={() => handleToggleSlot(dayKey, slot.key as SlotKey)}
                      activeOpacity={0.7}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isActive }}
                      accessibilityLabel={`${dayLabel} ${slot.label}`}
                    >
                      <Typography
                        variant="caption"
                        weight={isActive ? 'BOLD' : 'SEMIBOLD'}
                        colorKey={isActive ? 'PRIMARY_DARK' : 'TEXT_SECONDARY'}
                      >
                        {slot.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.scheduleHint}>
          Sáng 8–11h · Chiều 14–17h · Tối 18:30–20:30
        </Typography>

        <View style={styles.holdRow}>
          <View style={styles.holdCopy}>
            <Typography variant="body1" weight="BOLD">
              Cho phép giữ chỗ online
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              Sinh viên cọc qua UniNest để khoá phòng
            </Typography>
          </View>
          <Switch
            value={isOnlineHoldEnabled}
            onValueChange={setIsOnlineHoldEnabled}
            trackColor={{ false: THEME_COLORS.BORDER, true: THEME_COLORS.PRIMARY }}
            thumbColor={THEME_COLORS.WHITE}
            accessibilityLabel="Cho phép giữ chỗ online"
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: SPACING_TOKENS.XL, gap: 16 },
  intro: { gap: 6 },
  title: { letterSpacing: -0.3 },
  subtitle: { lineHeight: 22 },
  scheduleCard: {
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayRow: { height: 55, flexDirection: 'row', alignItems: 'center', gap: 20 },
  dayRowDivider: { borderTopWidth: 1, borderTopColor: THEME_COLORS.DIVIDER },
  dayLabel: { width: 28 },
  slotRow: { flexDirection: 'row', gap: 8 },
  slotChip: {
    height: 32,
    minWidth: 54,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  slotChipActive: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  scheduleHint: { marginTop: -4 },
  holdRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  holdCopy: { flex: 1, gap: 2 },
  depositField: { gap: 8 },
  depositValue: {
    height: 52,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
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
