import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, Input, ScreenContainer, Typography } from '@ui';
import { ResourceCard } from '../components';
import { useBookingDetail, useCancelBooking } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'CancelBooking'>;

export const CancelBookingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const cancelBooking = useCancelBooking();
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMessage('Vui lòng cho chủ trọ biết lý do bạn không thể đến');

      return;
    }

    try {
      await cancelBooking.mutateAsync({ id: params.id, reason: reason.trim() });
      toast.success('Đã hủy lịch hẹn');
      navigation.replace('BookingDetail', { id: params.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy lịch hẹn');
    }
  };

  return (
    <ScreenContainer>
      <HeaderBar title="Hủy lịch hẹn" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warning}>
          <TriangleAlert size={24} color={THEME_COLORS.ERROR} />
          <View style={styles.flex}>
            <Typography variant="body1" weight="BOLD" colorKey="ERROR">
              Chỉ còn dưới 24 giờ trước lịch hẹn
            </Typography>
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              Hãy gửi lý do để chủ trọ kịp sắp xếp lại thời gian.
            </Typography>
          </View>
        </View>
        {bookingQuery.data ? <ResourceCard resource={bookingQuery.data.listing} /> : null}
        <Input
          label="Lý do hủy"
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={500}
          placeholder="Nhập lý do bạn không thể đến..."
          errorMessage={errorMessage}
          helperText={`${reason.length}/500 ký tự`}
        />
        <View style={styles.similarBox}>
          <Typography variant="body1" weight="BOLD">
            Phòng tương tự đang còn trống
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Bạn vẫn có thể chọn một phòng và thời gian khác phù hợp hơn.
          </Typography>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Gửi lý do"
          variant="danger"
          fullWidth
          isLoading={cancelBooking.isPending}
          onPress={handleSubmit}
        />
        <Button
          title="Xem phòng khác"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('Main', { screen: 'Search' })}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD },
  warning: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.ERROR,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  flex: { flex: 1 },
  similarBox: {
    gap: SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  footer: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
