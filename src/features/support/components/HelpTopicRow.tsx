import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { HelpTopic } from '../types';

interface HelpTopicRowProps {
  topic: HelpTopic;
  articleCount: number;
  hasDivider: boolean;
  onPress: () => void;
}

export const HelpTopicRow = ({ topic, articleCount, hasDivider, onPress }: HelpTopicRowProps) => {
  const Icon = topic.icon;

  return (
    <TouchableOpacity
      style={[styles.row, hasDivider && styles.divider]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={[styles.iconFrame, { backgroundColor: topic.background }]}>
        <Icon size={18} color={topic.color} />
      </View>
      <Typography style={styles.label} numberOfLines={1}>
        {topic.label}
      </Typography>
      <Typography variant="label" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
        {`${articleCount} bài`}
      </Typography>
      <ChevronRight size={17} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  iconFrame: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
