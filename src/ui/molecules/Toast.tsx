import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  isVisible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  durationMs?: number;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Toast = ({
  isVisible,
  message,
  title,
  type = 'info',
  durationMs = 3500,
  onDismiss,
  style,
}: ToastProps) => {
  useEffect(() => {
    if (!isVisible || durationMs <= 0) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isVisible, durationMs, onDismiss]);

  if (!isVisible) return null;

  const config = TOAST_CONFIGS[type];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor, borderColor: config.borderColor },
        style,
      ]}
    >
      <View style={styles.iconWrapper}>{config.icon}</View>

      <View style={styles.content}>
        {title ? (
          <Typography variant="body2" weight="BOLD" color={config.textColor} style={styles.title}>
            {title}
          </Typography>
        ) : null}

        <Typography variant="caption" color={config.textColor}>
          {message}
        </Typography>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <X size={16} color={config.textColor} />
      </TouchableOpacity>
    </View>
  );
};

const TOAST_CONFIGS: Record<
  ToastType,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    borderColor: THEME_COLORS.SUCCESS,
    textColor: THEME_COLORS.SUCCESS,
    icon: <CheckCircle2 size={20} color={THEME_COLORS.SUCCESS} />,
  },
  error: {
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
    borderColor: THEME_COLORS.ERROR,
    textColor: THEME_COLORS.ERROR,
    icon: <AlertCircle size={20} color={THEME_COLORS.ERROR} />,
  },
  warning: {
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    borderColor: THEME_COLORS.WARNING,
    textColor: THEME_COLORS.WARNING,
    icon: <AlertTriangle size={20} color={THEME_COLORS.WARNING} />,
  },
  info: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderColor: THEME_COLORS.PRIMARY,
    textColor: THEME_COLORS.PRIMARY,
    icon: <Info size={20} color={THEME_COLORS.PRIMARY} />,
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    shadowColor: '#171B22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SPACING_TOKENS.SM,
  },
  iconWrapper: {
    marginRight: SPACING_TOKENS.SM,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  closeButton: {
    marginLeft: SPACING_TOKENS.SM,
  },
});
