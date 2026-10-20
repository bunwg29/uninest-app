import { StyleSheet, View } from 'react-native';
import { MessageSquareText } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { Button, Typography } from '@ui';
import type { ForumCategory } from '../types';

export interface ForumEmptyFeedProps {
  category?: ForumCategory;
  isSearching: boolean;
  onCreatePost: () => void;
  onViewOtherCategories: () => void;
}

const getCopy = (category: ForumCategory | undefined, isSearching: boolean) => {
  if (isSearching) {
    return {
      title: 'Không tìm thấy bài viết phù hợp',
      description: 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc nhé.',
      actionTitle: 'Viết bài đầu tiên',
    };
  }

  if (category === 'area_review') {
    return {
      title: 'Chưa ai review khu vực này',
      description:
        'Bạn đã ở Hoà Khánh hay Khuê Mỹ? Viết vài dòng về giá cả, an ninh và đi lại — các bạn tân sinh viên rất cần.',
      actionTitle: 'Viết review đầu tiên',
    };
  }

  return {
    title: 'Chưa có bài viết nào',
    description: 'Hãy là người đầu tiên chia sẻ kinh nghiệm hoặc tìm bạn ở ghép.',
    actionTitle: 'Viết bài đầu tiên',
  };
};

export const ForumEmptyFeed = ({
  category,
  isSearching,
  onCreatePost,
  onViewOtherCategories,
}: ForumEmptyFeedProps) => {
  const copy = getCopy(category, isSearching);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MessageSquareText size={72} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      </View>

      <Typography variant="h2" weight="SEMIBOLD" align="center" style={styles.title}>
        {copy.title}
      </Typography>

      <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
        {copy.description}
      </Typography>

      <Button
        title={copy.actionTitle}
        size="lg"
        fullWidth
        textStyle={styles.buttonText}
        onPress={onCreatePost}
        style={styles.primaryButton}
      />

      {category && !isSearching ? (
        <Button
          title="Xem chuyên mục khác"
          variant="outline"
          size="lg"
          fullWidth
          textStyle={[styles.buttonText, styles.secondaryText]}
          onPress={onViewOtherCategories}
          style={styles.secondaryButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXL + 8,
  },
  iconCircle: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  title: {
    marginTop: SPACING_TOKENS.LG,
    letterSpacing: -0.3,
  },
  description: {
    marginTop: SPACING_TOKENS.SM,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: SPACING_TOKENS.LG,
  },
  secondaryButton: {
    marginTop: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  buttonText: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  secondaryText: {
    color: THEME_COLORS.TEXT_SECONDARY,
  },
});
