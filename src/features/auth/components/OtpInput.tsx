import { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  type TextInputInstance,
  type TextInputKeyPressEvent,
} from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface OtpInputProps {
  code: string;
  length?: number;
  onCodeChange: (code: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export const OtpInput = ({
  code,
  length = 6,
  onCodeChange,
  hasError = false,
  disabled = false,
}: OtpInputProps) => {
  const inputRefs = useRef<Array<TextInputInstance | null>>([]);

  const digits = Array.from({ length }, (_, index) => code[index] || '');

  const handleChangeText = (text: string, index: number) => {
    if (disabled) {
      return;
    }

    const cleanText = text.replace(/[^0-9]/g, '');

    if (!cleanText) {
      const newCode = code.slice(0, index) + code.slice(index + 1);

      onCodeChange(newCode);

      return;
    }

    if (cleanText.length > 1) {
      const pastedCode = cleanText.slice(0, length);

      onCodeChange(pastedCode);

      const nextFocusIndex = Math.min(pastedCode.length, length - 1);

      inputRefs.current[nextFocusIndex]?.focus();

      return;
    }

    const newCodeArr = code.split('');

    newCodeArr[index] = cleanText[0];
    const newCode = newCodeArr.join('').slice(0, length);

    onCodeChange(newCode);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: TextInputKeyPressEvent, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBoxPress = (index: number) => {
    if (disabled) {
      return;
    }

    inputRefs.current[index]?.focus();
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => {
        const isFocused = code.length === index;

        return (
          <Pressable
            key={index}
            style={[
              styles.box,
              hasError && styles.boxError,
              isFocused && !hasError && styles.boxFocused,
              Boolean(digit) && !hasError && styles.boxFilled,
            ]}
            onPress={() => handleBoxPress(index)}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!disabled}
              selectTextOnFocus
            />

            <Typography
              variant="h2"
              weight="BOLD"
              color={
                hasError
                  ? THEME_COLORS.ERROR
                  : digit
                    ? THEME_COLORS.TEXT_PRIMARY
                    : THEME_COLORS.TEXT_PLACEHOLDER
              }
              style={styles.digitText}
            >
              {digit || ''}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING_TOKENS.MD,
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boxFocused: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  boxFilled: {
    borderColor: THEME_COLORS.PRIMARY,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  boxError: {
    borderColor: THEME_COLORS.ERROR,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    fontSize: 1,
  },
  digitText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
