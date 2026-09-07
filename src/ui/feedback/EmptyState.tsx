import type { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) => {
  const { t } = useTranslation();

  const resolvedTitle = title || t('ui.emptyTitle');
  const resolvedDescription = description || t('ui.emptyDescription');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <Inbox size={36} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
      </View>

      <Typography
        variant="h3"
        weight="BOLD"
        colorKey="TEXT_PRIMARY"
        align="center"
        style={styles.title}
      >
        {resolvedTitle}
      </Typography>

      <Typography variant="body2" colorKey="TEXT_MUTED" align="center" style={styles.description}>
        {resolvedDescription}
      </Typography>

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.MD,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  description: {
    marginBottom: SPACING_TOKENS.LG,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 160,
  },
});
