import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useListingDetail } from '@features/listings';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { ResourceCard, SlotGrid } from '../components';
import { useBookingSlots } from '../hooks';
import { useBookingStore } from '../store';
import { formatDateKey } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingNew'>;
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const useBookableListing = (id: string | undefined) => {
  const query = useListingDetail(id ?? '');
  const detail = query.data;
  const cover = detail?.images.find((image) => image.isCover) ?? detail?.images[0];

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    data: detail
      ? {
          id: detail.id,
          title: detail.title,
          price: detail.price,
          address: detail.address.fullAddress,
          imageUrl: cover?.url ?? null,
          deposit: detail.deposit,
          availability: detail.availability,
        }
      : undefined,
  };
};

export const BookingNewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const resourceId = route.params?.resourceId;
  const { resource, selectedDate, selectedSlot, startBooking, selectDate, selectSlot } =
    useBookingStore();
  const initializedResourceId = useRef<string | null>(null);
  const roomQuery = useBookableListing(resourceId);
  const activeResource = roomQuery.data ?? (resource?.id === resourceId ? resource : null);
  const date = selectedDate ?? getDefaultDate();
  const slotsQuery = useBookingSlots(activeResource?.id, date);
  const calendarDays = useMemo(() => createCalendarDays(date), [date]);

  useEffect(() => {
    if (!resourceId) {
      navigation.replace('Main', { screen: 'Search' });

      return;
    }

    if (
      roomQuery.data &&
      roomQuery.data.id === resourceId &&
      initializedResourceId.current !== resourceId
    ) {
      initializedResourceId.current = resourceId;
      startBooking(
        {
          id: roomQuery.data.id,
          title: roomQuery.data.title,
          price: roomQuery.data.price,
          address: roomQuery.data.address,
          imageUrl: roomQuery.data.imageUrl,
          deposit: roomQuery.data.deposit,
        },
        getDefaultDate()
      );
    }
  }, [navigation, resourceId, roomQuery.data, startBooking]);

  if (!resourceId || roomQuery.isLoading || (!activeResource && !roomQuery.isError)) {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đặt lịch xem phòng" onBack={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} size="large" />
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Đang tải thông tin phòng...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  if (roomQuery.isError || !activeResource) {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đặt lịch xem phòng" onBack={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <Typography variant="h3" weight="BOLD" align="center">
            Không tải được thông tin phòng
          </Typography>
          <Button title="Thử lại" variant="outline" onPress={() => roomQuery.refetch()} />
          <Button
            title="Quay lại Tìm trọ"
            variant="ghost"
            onPress={() => navigation.replace('Main', { screen: 'Search' })}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (roomQuery.data && roomQuery.data.availability !== 'available') {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đặt lịch xem phòng" onBack={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <Typography variant="h3" weight="BOLD" align="center">
            Phòng hiện chưa nhận lịch xem
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            {roomQuery.data.availability === 'holding'
              ? 'Phòng đang được sinh viên khác giữ chỗ.'
              : roomQuery.data.availability === 'rented'
                ? 'Phòng đã được cho thuê.'
                : 'Chủ trọ đã ngừng nhận yêu cầu cho phòng này.'}
          </Typography>
          <Button title="Quay lại" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar
        title="Đặt lịch xem phòng"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.closeButton}>
            <X size={21} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ResourceCard resource={activeResource} />
        <View style={styles.section}>
          <Typography variant="h3" weight="BOLD">
            Chọn ngày bạn muốn xem
          </Typography>
          <Typography variant="body2" weight="SEMIBOLD" style={styles.monthTitle}>
            Tháng {new Date(`${date}T12:00:00`).getMonth() + 1}/
            {new Date(`${date}T12:00:00`).getFullYear()}
          </Typography>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <Typography
                key={day}
                variant="caption"
                colorKey="TEXT_MUTED"
                align="center"
                style={styles.dayCell}
              >
                {day}
              </Typography>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((item, index) =>
              item ? (
                <TouchableOpacity
                  key={item.key}
                  disabled={item.isPast}
                  onPress={() => selectDate(item.key)}
                  style={[
                    styles.dayCell,
                    styles.calendarDay,
                    item.key === date && styles.selectedDay,
                    item.isPast && styles.pastDay,
                  ]}
                >
                  <Typography
                    variant="body2"
                    weight="SEMIBOLD"
                    color={
                      item.key === date
                        ? THEME_COLORS.WHITE
                        : item.isPast
                          ? THEME_COLORS.TEXT_PLACEHOLDER
                          : THEME_COLORS.TEXT_PRIMARY
                    }
                  >
                    {item.day}
                  </Typography>
                </TouchableOpacity>
              ) : (
                <View key={`empty-${index}`} style={styles.dayCell} />
              )
            )}
          </View>
        </View>
        <View style={styles.section}>
          <Typography variant="h3" weight="BOLD">
            Khung giờ ngày{' '}
            {new Intl.DateTimeFormat('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
            }).format(new Date(`${date}T12:00:00`))}
          </Typography>
          {slotsQuery.isLoading ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.loader} />
          ) : slotsQuery.isError ? (
            <View style={styles.errorBox}>
              <Typography variant="body2" colorKey="ERROR">
                Không thể tải khung giờ. Vui lòng thử lại.
              </Typography>
              <Button
                title="Thử lại"
                size="sm"
                variant="outline"
                onPress={() => slotsQuery.refetch()}
              />
            </View>
          ) : (
            <SlotGrid
              slots={slotsQuery.data ?? []}
              selected={selectedSlot?.startTime}
              onSelect={selectSlot}
            />
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            Thời gian đã chọn
          </Typography>
          <Typography variant="body2" weight="BOLD">
            {selectedSlot
              ? `${date.split('-').reverse().join('/')} • ${selectedSlot.time}`
              : 'Chưa chọn'}
          </Typography>
        </View>
        <Button
          title="Tiếp tục"
          disabled={!selectedSlot}
          onPress={() => navigation.navigate('BookingConfirm')}
          style={styles.continueButton}
        />
      </View>
    </ScreenContainer>
  );
};

const getDefaultDate = () => {
  const date = new Date();

  date.setDate(date.getDate() + 1);

  return formatDateKey(date);
};

const createCalendarDays = (dateKey: string) => {
  const selected = new Date(`${dateKey}T12:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayKey = formatDateKey(new Date());

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const key = formatDateKey(new Date(year, month, day));

      return { day, key, isPast: key <= todayKey };
    }),
  ];
};

const styles = StyleSheet.create({
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  section: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  monthTitle: { textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: SPACING_TOKENS.XS },
  dayCell: { width: '14.285%' },
  calendarDay: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  selectedDay: { backgroundColor: THEME_COLORS.PRIMARY },
  pastDay: { opacity: 0.45 },
  loader: { padding: SPACING_TOKENS.LG },
  errorBox: { gap: SPACING_TOKENS.SM, alignItems: 'flex-start' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  continueButton: { minWidth: 132 },
});
