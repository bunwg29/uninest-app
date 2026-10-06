import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

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
        <TouchableOpacity
          style={styles.sideButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel={leftIcon === 'close' ? 'Đóng' : 'Quay lại'}
        >
          {leftIcon === 'close' ? (
            <X size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          ) : (
            <ChevronLeft size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          )}
        </TouchableOpacity>
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
