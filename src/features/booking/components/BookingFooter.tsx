import type { ReactNode } from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Button } from '@ui';

type FooterButtonTone = 'primary' | 'outline' | 'danger';

interface FooterButtonProps {
  title: string;
  tone?: FooterButtonTone;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BookingFooter = ({ children }: { children: ReactNode }) => (
  <View style={styles.footer}>{children}</View>
);

export const FooterButton = ({
  title,
  tone = 'primary',
  disabled = false,
  isLoading = false,
  onPress,
  style,
}: FooterButtonProps) => {
  const isOutlined = tone !== 'primary';
  const isDisabledPrimary = disabled && tone === 'primary';
  const textStyle: StyleProp<TextStyle> = [
    styles.buttonText,
    tone === 'outline' ? styles.outlineText : null,
    tone === 'danger' ? styles.dangerText : null,
    isDisabledPrimary ? styles.disabledText : null,
  ];

  return (
    <Button
      title={title}
      size="lg"
      variant={isOutlined ? 'outline' : 'primary'}
      disabled={disabled}
      isLoading={isLoading}
      onPress={onPress}
      style={[
        styles.button,
        isOutlined ? styles.outlined : null,
        tone === 'danger' ? styles.dangerBorder : null,
        isDisabledPrimary ? styles.disabledPrimary : null,
        style,
      ]}
      textStyle={textStyle}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  button: { borderRadius: BORDER_RADIUS_TOKENS.MD },
  buttonText: { fontSize: 16, lineHeight: 24 },
  outlined: { backgroundColor: THEME_COLORS.SURFACE, opacity: 1 },
  outlineText: { color: THEME_COLORS.TEXT_SECONDARY },
  dangerBorder: { borderColor: THEME_COLORS.ERROR },
  dangerText: { color: THEME_COLORS.ERROR },
  disabledPrimary: { backgroundColor: THEME_COLORS.BORDER, opacity: 1 },
  disabledText: { color: OVERLAY_COLORS.STEP_PENDING_TEXT },
});
