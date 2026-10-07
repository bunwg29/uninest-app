import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography, BackButton } from '@ui';

export interface ForumHeaderProps {
  title: string;
  onBack?: () => void;
  leftIcon?: 'back' | 'close';
  rightAction?: ReactNode;
  hasBottomBorder?: boolean;
}

export const ForumHeader = ({
  title,
  onBack,
  leftIcon = 'back',
  rightAction,
  hasBottomBorder = false,
}: ForumHeaderProps) => (
  <View style={[styles.container, hasBottomBorder && styles.bottomBorder]}>
    <View style={styles.sideSlot}>
      {onBack ? (
        <BackButton onPress={onBack} icon={leftIcon === 'close' ? 'close' : 'back'} />
      ) : null}
    </View>

    <Typography variant="h3" weight="SEMIBOLD" numberOfLines={1} style={styles.title}>
      {title}
    </Typography>

    <View style={[styles.sideSlot, styles.rightSlot]}>{rightAction ?? null}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  sideSlot: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  sideButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
});
