import type { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';

export interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  alignTitle?: 'center' | 'left';
  hasBottomBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HeaderBar = ({
  title,
  subtitle,
  onBack,
  rightAction,
  alignTitle = 'center',
  hasBottomBorder = true,
  style,
}: HeaderBarProps) => {
  const isCentered = alignTitle === 'center';

  return (
    <View style={[styles.container, hasBottomBorder && styles.bottomBorder, style]}>
      <View style={styles.leftSlot}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        ) : null}
      </View>

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

      <View style={styles.rightSlot}>{rightAction || null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.SURFACE,
    paddingHorizontal: SPACING_TOKENS.MD,
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
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
