import type { ReactNode } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export const Button = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
  children,
}: ButtonProps) => {
  const isInteractive = !disabled && !isLoading;
  const containerStyles = [
    styles.base,
    SIZE_STYLES[size],
    VARIANT_STYLES[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const contentColor = getContentColor(variant, disabled);

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

          {children ? (
            children
          ) : title ? (
            <Typography
              variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body1' : 'body2'}
              weight="SEMIBOLD"
              color={contentColor}
              style={textStyle}
            >
              {title}
            </Typography>
          ) : null}

          {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

function getContentColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) {
    return THEME_COLORS.TEXT_PLACEHOLDER;
  }

  switch (variant) {
    case 'primary':
    case 'danger':
      return THEME_COLORS.SURFACE;
    case 'secondary':
    case 'ghost':
      return THEME_COLORS.PRIMARY;
    case 'outline':
      return THEME_COLORS.TEXT_PRIMARY;
    default:
      return THEME_COLORS.SURFACE;
  }
}

const SIZE_STYLES = StyleSheet.create({
  sm: {
    height: 36,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  md: {
    height: 44,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  lg: {
    height: 52,
    paddingHorizontal: SPACING_TOKENS.LG,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
});

const VARIANT_STYLES = StyleSheet.create({
  primary: {
    backgroundColor: THEME_COLORS.PRIMARY,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: THEME_COLORS.TRANSPARENT,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  ghost: {
    backgroundColor: THEME_COLORS.TRANSPARENT,
    borderWidth: 0,
  },
  danger: {
    backgroundColor: THEME_COLORS.ERROR,
    borderWidth: 0,
  },
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.BORDER,
    opacity: 0.65,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: SPACING_TOKENS.SM,
  },
  rightIconWrapper: {
    marginLeft: SPACING_TOKENS.SM,
  },
});
