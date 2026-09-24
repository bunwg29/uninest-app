import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Star } from 'lucide-react-native';
import { Button, Modal, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { RootStackParamList } from '@navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LandlordReviewItem {
  id: string;
  studentName: string;
  initials: string;
  rating: number;
  date: string;
  listingTitle: string;
  content: string;
  reply?: string;
}

const INITIAL_REVIEWS: LandlordReviewItem[] = [
  {
    id: 'RV-204',
    studentName: 'Lê Minh Khoa',
    initials: 'MK',
    rating: 4,
    date: 'Hôm nay',
    listingTitle: 'Phòng khép kín tầng 2, ban công phơi đồ',
    content:
      'Phòng sạch, đúng như ảnh. Cô chủ phản hồi nhanh và rất nhiệt tình. Khu vực để xe hơi nhỏ nhưng an ninh tốt.',
  },
  {
    id: 'RV-196',
    studentName: 'Trần Thu Ngân',
    initials: 'TN',
    rating: 5,
    date: '12/09/2026',
    listingTitle: 'Phòng tầng 3 có ban công, đón gió',
    content: 'Phòng thoáng và gần trường. Mọi chi phí đều được cô thông báo rõ ràng.',
    reply: 'Cảm ơn Ngân đã tin tưởng và lựa chọn phòng của cô nhé!',
  },
];

export const LandlordReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<LandlordReviewItem | null>(null);
  const [reply, setReply] = useState('');

  const handleOpenReply = (review: LandlordReviewItem) => {
    setSelectedReview(review);
    setReply(review.reply || '');
  };

  const handleSubmitReply = () => {
    if (!selectedReview || !reply.trim()) return;

    setReviews((current) =>
      current.map((review) =>
        review.id === selectedReview.id ? { ...review, reply: reply.trim() } : review
      )
    );
    setSelectedReview(null);
    setReply('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Đánh giá
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('LandlordPublicProfile')}>
          <Typography variant="caption" weight="BOLD" colorKey="PRIMARY_DARK">
            Hồ sơ
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.ratingBlock}>
            <Typography variant="h1" weight="BOLD">
              4,8
            </Typography>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  fill={THEME_COLORS.SECONDARY}
                  color={THEME_COLORS.SECONDARY}
                />
              ))}
            </View>
            <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
              24 đánh giá
            </Typography>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.responseBlock}>
            <Typography variant="body1" weight="BOLD" colorKey="SUCCESS">
              96%
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              Tỉ lệ phản hồi
            </Typography>
            <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
              Trung bình 10 phút
            </Typography>
          </View>
        </View>

        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewerRow}>
              <View style={styles.avatar}>
                <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
                  {review.initials}
                </Typography>
              </View>
              <View style={styles.reviewerCopy}>
                <Typography variant="body2" weight="BOLD">
                  {review.studentName}
                </Typography>
                <View style={styles.metaRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      fill={
                        star <= review.rating ? THEME_COLORS.SECONDARY : THEME_COLORS.TRANSPARENT
                      }
                      color={star <= review.rating ? THEME_COLORS.SECONDARY : THEME_COLORS.BORDER}
                    />
                  ))}
                  <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" style={styles.dateText}>
                    {review.date}
                  </Typography>
                </View>
              </View>
            </View>

            <Typography
              variant="caption"
              weight="BOLD"
              colorKey="PRIMARY_DARK"
              style={styles.listingTitle}
            >
              {review.listingTitle}
            </Typography>
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {review.content}
            </Typography>

            {review.reply ? (
              <View style={styles.replyBox}>
                <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER">
                  PHẢN HỒI CỦA BẠN
                </Typography>
                <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.replyText}>
                  {review.reply}
                </Typography>
              </View>
            ) : (
              <Button
                title="Phản hồi đánh giá"
                variant="outline"
                size="sm"
                onPress={() => handleOpenReply(review)}
                style={styles.replyButton}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        title="Phản hồi đánh giá"
        confirmText="Gửi phản hồi"
        onConfirm={handleSubmitReply}
      >
        <TextInput
          value={reply}
          onChangeText={setReply}
          placeholder="Viết lời cảm ơn hoặc giải đáp góp ý..."
          placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
          multiline
          maxLength={500}
          style={styles.replyInput}
        />
        <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER" align="right">
          {reply.length}/500
        </Typography>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    height: 58,
    paddingHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  headerTitle: { flex: 1, marginLeft: 18 },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  summaryCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    flexDirection: 'row',
    marginBottom: 14,
  },
  ratingBlock: { flex: 1, alignItems: 'center' },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  summaryDivider: { width: 1, backgroundColor: THEME_COLORS.BORDER },
  responseBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reviewCard: {
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    marginBottom: 12,
  },
  reviewerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerCopy: { flex: 1, marginLeft: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dateText: { marginLeft: 6 },
  listingTitle: { marginTop: 12, marginBottom: 6 },
  replyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.PRIMARY,
  },
  replyText: { marginTop: 5 },
  replyButton: { alignSelf: 'flex-start', marginTop: 12, borderColor: THEME_COLORS.PRIMARY },
  replyInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: 12,
    color: THEME_COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
  },
});
