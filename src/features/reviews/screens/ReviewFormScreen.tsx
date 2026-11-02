import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, HeaderBar, Input, NoticeBanner, ScreenContainer, Typography } from '@ui';
import { Info } from 'lucide-react-native';
import { SPACING_TOKENS } from '@theme';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { StarRating } from '../components';
import { useSaveReview } from '../hooks';
import { REVIEW_COMMENT_MAX_LENGTH } from '../types';
import { reviewSchema, type ReviewFormValues } from '../validations';

type ScreenRoute = RouteProp<RootStackParamList, 'ReviewForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReviewForm'>;

const RATING_FIELDS = [
  {
    name: 'locationRating' as const,
    label: 'Vị trí',
    description: 'Mức độ thuận tiện và môi trường xung quanh',
  },
  {
    name: 'valueRating' as const,
    label: 'Giá trị so với giá tiền',
    description: 'Mức độ phù hợp giữa chất lượng và chi phí',
  },
  {
    name: 'landlordRating' as const,
    label: 'Thái độ chủ trọ',
    description: 'Sự hỗ trợ, minh bạch và thân thiện',
  },
  {
    name: 'amenitiesRating' as const,
    label: 'Tiện ích',
    description: 'Chất lượng các tiện ích được giới thiệu',
  },
];

export const ReviewFormScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const toast = useToast();
  const { listingId, listingTitle, bookingId, review } = route.params;
  const mutation = useSaveReview(listingId, review?.id);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      locationRating: review?.locationRating ?? 0,
      valueRating: review?.valueRating ?? 0,
      landlordRating: review?.landlordRating ?? 0,
      amenitiesRating: review?.amenitiesRating ?? 0,
      comment: review?.comment ?? '',
    },
  });
  const ratings = watch(['locationRating', 'valueRating', 'landlordRating', 'amenitiesRating']);
  const average = useMemo(
    () => ratings.reduce((total, rating) => total + rating, 0) / ratings.length,
    [ratings]
  );

  const submit = handleSubmit((values) => {
    mutation.mutate(
      {
        ...values,
        bookingId: review ? undefined : bookingId,
        comment: values.comment?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(review ? 'Đã cập nhật đánh giá' : 'Cảm ơn bạn đã chia sẻ đánh giá');
          navigation.goBack();
        },
        onError: (error) => toast.error(error.message),
      }
    );
  });

  return (
    <ScreenContainer scrollable padding="md">
      <HeaderBar
        title={review ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View>
          <Typography variant="h3" weight="BOLD">
            {listingTitle || 'Phòng đã xem'}
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.intro}>
            Chia sẻ trải nghiệm thực tế để giúp các sinh viên khác lựa chọn phù hợp hơn.
          </Typography>
        </View>

        <NoticeBanner tone="info" icon={Info}>
          Đánh giá được hiển thị công khai. Bạn có thể chỉnh sửa trong vòng 7 ngày sau khi gửi.
        </NoticeBanner>

        <View style={styles.average}>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            Điểm trung bình hiện tại
          </Typography>
          <Typography variant="h1" weight="BOLD">
            {average > 0 ? average.toFixed(1).replace('.', ',') : '--'} / 5
          </Typography>
        </View>

        {RATING_FIELDS.map((field) => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: controlledField }) => (
              <View style={styles.ratingField}>
                <Typography variant="body1" weight="SEMIBOLD">
                  {field.label}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  {field.description}
                </Typography>
                <StarRating
                  value={controlledField.value}
                  onChange={controlledField.onChange}
                  accessibilityLabel={field.label}
                />
                {errors[field.name] ? (
                  <Typography variant="caption" colorKey="ERROR">
                    {errors[field.name]?.message}
                  </Typography>
                ) : null}
              </View>
            )}
          />
        ))}

        <Controller
          control={control}
          name="comment"
          render={({ field }) => (
            <Input
              label="Nhận xét"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
              multiline
              maxLength={REVIEW_COMMENT_MAX_LENGTH}
              helperText={`${field.value?.length ?? 0}/${REVIEW_COMMENT_MAX_LENGTH} ký tự`}
              errorMessage={errors.comment?.message}
            />
          )}
        />

        <Button
          title={review ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          onPress={() => void submit()}
          isLoading={mutation.isPending}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { gap: SPACING_TOKENS.LG, paddingBottom: SPACING_TOKENS.XL },
  intro: { marginTop: SPACING_TOKENS.XS, lineHeight: 20 },
  average: { alignItems: 'center', gap: SPACING_TOKENS.XS },
  ratingField: { gap: SPACING_TOKENS.XS },
});
