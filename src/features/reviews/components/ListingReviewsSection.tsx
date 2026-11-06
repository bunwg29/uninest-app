import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageSquareText } from 'lucide-react-native';
import { Button, SkeletonBox, Typography } from '@ui';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '@features/auth';
import { useReviewEligibility, useReviews } from '../hooks';
import { ReviewCard } from './ReviewCard';

interface ListingReviewsSectionProps {
  listingId: string;
  listingTitle: string;
}

export const ListingReviewsSection = ({ listingId, listingTitle }: ListingReviewsSectionProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { role } = useAuth();
  const reviewsQuery = useReviews(listingId);
  const eligibilityQuery = useReviewEligibility(listingId, role === 'student');
  const firstPage = reviewsQuery.data?.pages[0];
  const reviews = firstPage?.items.slice(0, 2) ?? [];
  const eligibility = eligibilityQuery.data;

  const openReviews = () =>
    navigation.navigate('Reviews', { listingId, listingTitle, canManage: false });

  const openReviewForm = () => {
    if (!eligibility?.eligible) return;

    navigation.navigate('ReviewForm', {
      listingId,
      listingTitle,
      bookingId: eligibility.bookingId,
    });
  };

  if (reviewsQuery.isLoading) {
    return (
      <View style={styles.loading}>
        <SkeletonBox height={92} />
        <SkeletonBox height={92} />
      </View>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <View style={styles.state}>
        <Typography variant="body2" colorKey="TEXT_MUTED">
          Không thể tải đánh giá lúc này.
        </Typography>
        <TouchableOpacity onPress={() => void reviewsQuery.refetch()} accessibilityRole="button">
          <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY">
            Thử lại
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === 'student' && eligibility?.eligible ? (
        <Button title="Viết đánh giá" variant="outline" onPress={openReviewForm} />
      ) : null}

      {reviews.length === 0 ? (
        <View style={styles.state}>
          <MessageSquareText size={30} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            Chưa có đánh giá cho tin đăng này.
          </Typography>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} compact />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAll} onPress={openReviews} accessibilityRole="button">
            <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
              Xem tất cả {firstPage?.summary.reviewCount ?? 0} đánh giá
            </Typography>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING_TOKENS.MD },
  list: { gap: SPACING_TOKENS.SM },
  loading: { gap: SPACING_TOKENS.SM },
  state: { alignItems: 'center', gap: SPACING_TOKENS.SM, paddingVertical: SPACING_TOKENS.MD },
  viewAll: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
