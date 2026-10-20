import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useListingDetail } from '@features/listings/hooks/useListingDetail';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import {
  BookingCalendar,
  BookingFooter,
  BookingStepper,
  FooterButton,
  ResourceCard,
  SlotGrid,
} from '../components';
import { useBookingSlots } from '../hooks';
import { useBookingStore } from '../store';
import { formatDateKey, formatDayLabel } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingNew'>;
type BookingStep = 'date' | 'time';

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
          landlordName: detail.landlord?.fullName ?? null,
          availability: detail.availability,
          myBooking: detail.myBooking ?? null,
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
  const [step, setStep] = useState<BookingStep>('date');
  const [isDatePicked, setIsDatePicked] = useState(false);
  const [anchorDate, setAnchorDate] = useState(date);

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
          landlordName: roomQuery.data.landlordName,
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

  if (roomQuery.data?.myBooking) {
    const existingBookingId = roomQuery.data.myBooking.id;

    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đặt lịch xem phòng" onBack={() => navigation.goBack()} />
        <View style={styles.centerState}>
          <Typography variant="h3" weight="BOLD" align="center">
            Bạn đã có lịch hẹn cho phòng này
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            Mỗi phòng chỉ có một lịch hẹn đang xử lý. Hãy hủy lịch hiện tại nếu muốn đổi sang khung
            giờ khác.
          </Typography>
          <Button
            title="Xem lịch hẹn của tôi"
            onPress={() => navigation.replace('BookingDetail', { id: existingBookingId })}
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

  const isTimeStep = step === 'time';
  const handleBack = () => (isTimeStep ? setStep('date') : navigation.goBack());
  const handleSelectDate = (dateKey: string) => {
    selectDate(dateKey);
    setAnchorDate(dateKey);
    setIsDatePicked(true);
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Đặt lịch xem phòng" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BookingStepper step={isTimeStep ? 2 : 1} />
        <View style={styles.body}>
          {isTimeStep ? null : <ResourceCard resource={activeResource} />}
          {isTimeStep ? null : (
            <View style={styles.titleBlock}>
              <Typography variant="h2" weight="SEMIBOLD" style={styles.title}>
                Chọn ngày bạn muốn xem
              </Typography>
              <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.subtitle}>
                Chỉ hiện những ngày chủ trọ đã báo rảnh.
              </Typography>
            </View>
          )}
          <BookingCalendar
            anchorDate={anchorDate}
            selectedDate={isDatePicked ? date : null}
            mode={isTimeStep ? 'week' : 'month'}
            onSelect={handleSelectDate}
            onAnchorChange={setAnchorDate}
          />
          {isTimeStep ? (
            <>
              <View style={styles.titleBlock}>
                <Typography variant="h2" weight="SEMIBOLD" style={styles.title}>
                  {`Khung giờ ngày ${formatDayLabel(date)}`}
                </Typography>
                <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.subtitle}>
                  Mỗi lượt xem khoảng 20 phút.
                </Typography>
              </View>
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
            </>
          ) : null}
        </View>
      </ScrollView>
      <BookingFooter>
        {isTimeStep ? (
          <View style={styles.selectionRow}>
            <View>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Đã chọn
              </Typography>
              <Typography variant="body2" weight="SEMIBOLD">
                {selectedSlot ? `${selectedSlot.time} · ${formatDayLabel(date)}` : 'Chưa chọn'}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setStep('date')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Đổi ngày"
            >
              <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                Đổi
              </Typography>
            </TouchableOpacity>
          </View>
        ) : null}
        {isTimeStep ? (
          <FooterButton
            title="Tiếp tục"
            disabled={!selectedSlot}
            onPress={() => navigation.navigate('BookingConfirm')}
          />
        ) : (
          <FooterButton
            title={isDatePicked ? 'Tiếp tục' : 'Chọn một ngày để tiếp tục'}
            disabled={!isDatePicked}
            onPress={() => setStep('time')}
          />
        )}
      </BookingFooter>
    </ScreenContainer>
  );
};

const getDefaultDate = () => {
  const date = new Date();

  date.setDate(date.getDate() + 1);

  return formatDateKey(date);
};

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
  content: { paddingBottom: SPACING_TOKENS.LG },
  body: { gap: 20, paddingHorizontal: 16, paddingTop: 20 },
  titleBlock: { gap: 8 },
  title: { letterSpacing: -0.3 },
  subtitle: { lineHeight: 22 },
  loader: { padding: SPACING_TOKENS.LG },
  errorBox: { gap: SPACING_TOKENS.SM, alignItems: 'flex-start' },
  selectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
