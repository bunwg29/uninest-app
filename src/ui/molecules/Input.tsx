import { useState, type ReactNode } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff, XCircle } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';

export interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  clearable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  onClear?: () => void;
}

export const Input = ({
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  isPassword = false,
  clearable = false,
  containerStyle,
  inputContainerStyle,
  value,
  onChangeText,
  onClear,
  editable = true,
  placeholderTextColor = THEME_COLORS.TEXT_PLACEHOLDER,
  style,
  ...rest
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  const hasError = Boolean(errorMessage);
  const showClear = clearable && Boolean(value) && editable;

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  const isMultiline = Boolean(rest.multiline);

  const borderColor = hasError
    ? THEME_COLORS.ERROR
    : isFocused
      ? THEME_COLORS.PRIMARY
      : THEME_COLORS.BORDER;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography
          variant="label"
          weight="MEDIUM"
          colorKey={hasError ? 'ERROR' : 'TEXT_PRIMARY'}
          style={styles.label}
        >
          {label}
        </Typography>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isMultiline && styles.multilineContainer,
          { borderColor },
          !editable && styles.disabledContainer,
          inputContainerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          style={[styles.input, isMultiline && styles.multilineInput, style]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword ? isSecure : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={isMultiline ? 'top' : undefined}
          {...rest}
        />

        {showClear ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <XCircle size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </TouchableOpacity>
        ) : null}

        {isPassword ? (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSecure ? (
              <EyeOff size={20} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            ) : (
              <Eye size={20} color={THEME_COLORS.PRIMARY} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError ? (
        <Typography variant="caption" colorKey="ERROR" style={styles.messageText}>
          {errorMessage}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.messageText}>
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING_TOKENS.MD,
  },
  label: {
    marginBottom: SPACING_TOKENS.XS + 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  multilineContainer: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: SPACING_TOKENS.SM,
  },
  disabledContainer: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  input: {
    flex: 1,
    height: '100%',
    color: THEME_COLORS.TEXT_PRIMARY,
    fontSize: 14,
    paddingVertical: 0,
  },
  multilineInput: {
    height: undefined,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  leftIconWrapper: {
    marginRight: SPACING_TOKENS.SM,
  },
  rightIconWrapper: {
    marginLeft: SPACING_TOKENS.SM,
  },
  passwordToggle: {
    marginLeft: SPACING_TOKENS.SM,
  },
  messageText: {
    marginTop: SPACING_TOKENS.XS,
  },
});
