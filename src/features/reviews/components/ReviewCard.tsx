import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Flag, MessageSquare, Pencil } from 'lucide-react-native';
import { Avatar, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { Review } from '../types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
  canEdit?: boolean;
  canManage?: boolean;
  onEdit?: () => void;
  onReply?: () => void;
  onReport?: () => void;
  compact?: boolean;
}

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const ReviewCard = ({
  review,
  canEdit = false,
  canManage = false,
  onEdit,
  onReply,
  onReport,
  compact = false,
}: ReviewCardProps) => (
  <View style={[styles.card, compact && styles.compactCard]}>
    <View style={styles.header}>
      <Avatar
        uri={review.student?.avatarUrl ?? undefined}
        name={review.student?.fullName ?? 'Sinh viên UniNest'}
        size="sm"
      />
      <View style={styles.identity}>
        <Typography variant="body2" weight="SEMIBOLD">
          {review.student?.fullName ?? 'Sinh viên UniNest'}
        </Typography>
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {formatDate(review.createdAt)}
        </Typography>
      </View>
      <View style={styles.score}>
        <Typography variant="body2" weight="BOLD">
          {review.averageRating.toFixed(1).replace('.', ',')}
        </Typography>
        <Typography variant="caption" colorKey="TEXT_MUTED">
          /5
        </Typography>
      </View>
    </View>

    <StarRating value={review.averageRating} readonly size={compact ? 16 : 18} />

    {review.comment ? (
      <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.comment}>
        {review.comment}
      </Typography>
    ) : null}

    {!compact ? (
      <View style={styles.criteria}>
        <Criterion label="Vị trí" value={review.locationRating} />
        <Criterion label="Giá trị" value={review.valueRating} />
        <Criterion label="Chủ trọ" value={review.landlordRating} />
        <Criterion label="Tiện ích" value={review.amenitiesRating} />
      </View>
    ) : null}

    {review.landlordReply ? (
      <View style={styles.reply}>
        <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
          Phản hồi từ chủ trọ
        </Typography>
        <Typography variant="body2" colorKey="TEXT_SECONDARY">
          {review.landlordReply}
        </Typography>
      </View>
    ) : null}

    {canEdit || canManage ? (
      <View style={styles.actions}>
        {canEdit && onEdit ? <Action icon={Pencil} title="Chỉnh sửa" onPress={onEdit} /> : null}
        {canManage && !review.landlordReply && onReply ? (
          <Action icon={MessageSquare} title="Phản hồi" onPress={onReply} />
        ) : null}
        {canManage && onReport ? (
          <Action icon={Flag} title="Báo cáo" onPress={onReport} isDanger />
        ) : null}
      </View>
    ) : null}
  </View>
);

const Criterion = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.criterion}>
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="caption" weight="BOLD">
      {value}/5
    </Typography>
  </View>
);

const Action = ({
  icon: Icon,
  title,
  onPress,
  isDanger = false,
}: {
  icon: typeof Pencil;
  title: string;
  onPress: () => void;
  isDanger?: boolean;
}) => (
  <TouchableOpacity
    style={styles.action}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <Icon size={16} color={isDanger ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY} />
    <Typography
      variant="caption"
      weight="SEMIBOLD"
      color={isDanger ? THEME_COLORS.ERROR : THEME_COLORS.PRIMARY}
    >
      {title}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.SM,
  },
  compactCard: { padding: SPACING_TOKENS.SM + SPACING_TOKENS.XXS },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  identity: { flex: 1 },
  score: { flexDirection: 'row', alignItems: 'baseline' },
  comment: { lineHeight: 21 },
  criteria: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  criterion: {
    width: '47%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  reply: {
    gap: SPACING_TOKENS.XS,
    padding: SPACING_TOKENS.SM,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING_TOKENS.SM,
    paddingTop: SPACING_TOKENS.XS,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
  },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.SM,
  },
});
