import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageSquareText } from 'lucide-react-native';
import { EmptyState, HeaderBar, Input, Modal, ScreenContainer, SkeletonBox, Typography } from '@ui';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '@features/auth';
import { FilterChip } from '@ui';
import { ReviewCard, ReviewSummaryCard } from '../components';
import { useReplyReview, useReportReview, useReviewEligibility, useReviews } from '../hooks';
import type { Review } from '../types';
import {
  REVIEW_REPLY_MAX_LENGTH,
  REVIEW_REPORT_NOTE_MAX_LENGTH,
  REVIEW_REPORT_REASON_MAX_LENGTH,
} from '../types';

type ScreenRoute = RouteProp<RootStackParamList, 'Reviews'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reviews'>;

export const ReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const toast = useToast();
  const { user, role } = useAuth();
  const { listingId, listingTitle, canManage = false } = route.params;
  const [stars, setStars] = useState<number>();
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [reportReview, setReportReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportNote, setReportNote] = useState('');
  const reviewsQuery = useReviews(listingId, stars);
  const eligibilityQuery = useReviewEligibility(listingId, role === 'student');
  const replyMutation = useReplyReview(listingId);
  const reportMutation = useReportReview();
  const reviews = useMemo(
    () => reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reviewsQuery.data]
  );
  const summary = reviewsQuery.data?.pages[0]?.summary;

  const handleReply = () => {
    if (!replyReview || !replyContent.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi');

      return;
    }

    replyMutation.mutate(
      { reviewId: replyReview.id, content: replyContent.trim() },
      {
        onSuccess: () => {
          setReplyReview(null);
          setReplyContent('');
          toast.success('Đã đăng phản hồi');
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleReport = () => {
    if (!reportReview || !reportReason.trim()) {
      toast.warning('Vui lòng nhập lý do báo cáo');

      return;
    }

    reportMutation.mutate(
      {
        reviewId: reportReview.id,
        payload: { reason: reportReason.trim(), note: reportNote.trim() || undefined },
      },
      {
        onSuccess: () => {
          setReportReview(null);
          setReportReason('');
          setReportNote('');
          toast.success('Đã gửi báo cáo đánh giá');
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleWriteReview = () => {
    const eligibility = eligibilityQuery.data;

    if (!eligibility?.eligible) return;

    navigation.navigate('ReviewForm', {
      listingId,
      listingTitle,
      bookingId: eligibility.bookingId,
    });
  };

  const renderReview = ({ item }: { item: Review }) => {
    const canEdit =
      role === 'student' &&
      item.student?.id === user?.id &&
      new Date(item.editedUntil).getTime() >= Date.now();

    return (
      <ReviewCard
        review={item}
        canEdit={canEdit}
        canManage={role === 'landlord' && canManage}
        onEdit={() => navigation.navigate('ReviewForm', { listingId, listingTitle, review: item })}
        onReply={() => {
          setReplyContent('');
          setReplyReview(item);
        }}
        onReport={() => {
          setReportReason('');
          setReportNote('');
          setReportReview(item);
        }}
      />
    );
  };

  if (reviewsQuery.isLoading) {
    return (
      <ScreenContainer padding="md" keyboardAvoiding={false}>
        <HeaderBar title="Đánh giá" onBack={() => navigation.goBack()} />
        <View style={styles.skeletons}>
          <SkeletonBox height={130} />
          <SkeletonBox height={190} />
          <SkeletonBox height={190} />
        </View>
      </ScreenContainer>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <ScreenContainer keyboardAvoiding={false}>
        <HeaderBar title="Đánh giá" onBack={() => navigation.goBack()} />
        <EmptyState
          title="Không thể tải đánh giá"
          description="Vui lòng kiểm tra kết nối và thử lại."
          actionTitle="Thử lại"
          onAction={() => void reviewsQuery.refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Đánh giá" onBack={() => navigation.goBack()} />
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={reviewsQuery.isRefetching && !reviewsQuery.isFetchingNextPage}
            onRefresh={() => void reviewsQuery.refetch()}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            void reviewsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {listingTitle ? (
              <Typography variant="h3" weight="BOLD">
                {listingTitle}
              </Typography>
            ) : null}
            {summary ? <ReviewSummaryCard summary={summary} /> : null}
            {role === 'student' && eligibilityQuery.data?.eligible ? (
              <FilterChip label="Viết đánh giá" isSelected onPress={handleWriteReview} />
            ) : null}
            <Typography variant="body2" weight="SEMIBOLD">
              Lọc theo số sao
            </Typography>
            <View style={styles.filters}>
              <FilterChip
                label="Tất cả"
                isSelected={stars === undefined}
                onPress={() => setStars(undefined)}
              />
              {[5, 4, 3, 2, 1].map((value) => (
                <FilterChip
                  key={value}
                  label={`${value} sao`}
                  isSelected={stars === value}
                  onPress={() => setStars(value)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={stars ? `Chưa có đánh giá ${stars} sao` : 'Chưa có đánh giá'}
            description={
              stars
                ? 'Hãy chọn mức sao khác để xem đánh giá.'
                : 'Chưa có sinh viên nào chia sẻ trải nghiệm về phòng này.'
            }
            icon={<MessageSquareText size={36} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          />
        }
        ListFooterComponent={
          reviewsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.footer} />
          ) : undefined
        }
      />

      <Modal
        isVisible={replyReview !== null}
        onClose={() => setReplyReview(null)}
        title="Phản hồi đánh giá"
        description="Phản hồi sẽ hiển thị công khai và chỉ được gửi một lần."
        confirmText="Đăng phản hồi"
        onConfirm={handleReply}
        isConfirmLoading={replyMutation.isPending}
      >
        <Input
          value={replyContent}
          onChangeText={setReplyContent}
          placeholder="Nhập nội dung phản hồi..."
          multiline
          maxLength={REVIEW_REPLY_MAX_LENGTH}
          helperText={`${replyContent.length}/${REVIEW_REPLY_MAX_LENGTH} ký tự`}
        />
      </Modal>

      <Modal
        isVisible={reportReview !== null}
        onClose={() => setReportReview(null)}
        title="Báo cáo đánh giá"
        description="Hãy cho UniNest biết vì sao đánh giá này không chính xác."
        confirmText="Gửi báo cáo"
        confirmVariant="danger"
        onConfirm={handleReport}
        isConfirmLoading={reportMutation.isPending}
      >
        <Input
          label="Lý do"
          value={reportReason}
          onChangeText={setReportReason}
          maxLength={REVIEW_REPORT_REASON_MAX_LENGTH}
          placeholder="Ví dụ: Nội dung không đúng sự thật"
        />
        <Input
          label="Ghi chú"
          value={reportNote}
          onChangeText={setReportNote}
          maxLength={REVIEW_REPORT_NOTE_MAX_LENGTH}
          placeholder="Bổ sung thông tin nếu cần..."
          multiline
        />
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  headerContent: { gap: SPACING_TOKENS.MD, marginBottom: SPACING_TOKENS.MD },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  separator: { height: SPACING_TOKENS.MD },
  skeletons: { gap: SPACING_TOKENS.MD },
  footer: { marginVertical: SPACING_TOKENS.LG },
});
