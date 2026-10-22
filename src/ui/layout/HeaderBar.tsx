import type { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { BackButton } from '../atoms/BackButton';
import { Typography } from '../atoms/Typography';

export interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  rightActionWidth?: number;
  alignTitle?: 'center' | 'left';
  hasBottomBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HeaderBar = ({
  title,
  subtitle,
  onBack,
  rightAction,
  rightActionWidth,
  alignTitle = 'center',
  hasBottomBorder = true,
  style,
}: HeaderBarProps) => {
  const isCentered = alignTitle === 'center';

  return (
    <View style={[styles.container, hasBottomBorder && styles.bottomBorder, style]}>
      <View style={styles.leftSlot}>{onBack ? <BackButton onPress={onBack} /> : null}</View>

      <View style={[styles.titleSlot, isCentered && styles.centeredTitleSlot]}>
        <Typography
          variant="h3"
          weight="SEMIBOLD"
          colorKey="TEXT_PRIMARY"
          numberOfLines={1}
          align={isCentered ? 'center' : 'left'}
        >
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            variant="caption"
            colorKey="TEXT_MUTED"
            numberOfLines={1}
            align={isCentered ? 'center' : 'left'}
          >
            {subtitle}
          </Typography>
        ) : null}
      </View>

      <View style={[styles.rightSlot, rightActionWidth ? { width: rightActionWidth } : null]}>
        {rightAction || null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.XS,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredTitleSlot: {
    alignItems: 'center',
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
