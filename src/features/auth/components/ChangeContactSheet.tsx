import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Phone } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Input, KeyboardAvoidingContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import { authService, type ContactKind } from '../services';
import { OtpInput } from './OtpInput';

const PHONE_PATTERN = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface ChangeContactSheetProps {
  kind: ContactKind | null;
  currentValue?: string | null;
  onClose: () => void;
  onChanged: (kind: ContactKind, value: string) => void;
}

const COPY: Record<ContactKind, { title: string; label: string; placeholder: string }> = {
  phone: { title: 'Đổi số điện thoại', label: 'Số điện thoại mới', placeholder: '0905123456' },
  email: { title: 'Đổi email', label: 'Email mới', placeholder: 'ban@gmail.com' },
};

export const ChangeContactSheet = ({
  kind,
  currentValue,
  onClose,
  onChanged,
}: ChangeContactSheetProps) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [value, setValue] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!kind) return;

    setValue('');
    setRequestId(null);
    setOtp('');
    setErrorMessage(undefined);
    setSecondsLeft(0);
  }, [kind]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!kind) return null;

  const copy = COPY[kind];
  const normalizedValue = kind === 'email' ? value.trim().toLowerCase() : value.trim();

  const validate = () => {
    if (kind === 'phone' && !PHONE_PATTERN.test(normalizedValue)) {
      return 'Số điện thoại không hợp lệ';
    }

    if (kind === 'email' && !EMAIL_PATTERN.test(normalizedValue)) {
      return 'Email không đúng định dạng';
    }

    if (normalizedValue === (currentValue ?? '').trim().toLowerCase()) {
      return 'Giá trị mới phải khác giá trị hiện tại';
    }

    return undefined;
  };

  const handleRequestOtp = async () => {
    const validationError = validate();

    if (validationError) {
      setErrorMessage(validationError);

      return;
    }

    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      const result = await authService.requestContactOtp(kind, normalizedValue);

      setRequestId(result.requestId);
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể gửi mã OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!requestId || otp.length !== OTP_LENGTH) return;

    setIsSubmitting(true);

    try {
      await authService.verifyContactOtp(kind, requestId, otp);
      toast.success(`${copy.label.replace(' mới', '')} đã được cập nhật`);
      onChanged(kind, normalizedValue);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Mã OTP không đúng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Icon = kind === 'phone' ? Phone : Mail;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingContainer style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.handle} />
            <Typography variant="h3" weight="BOLD">
              {copy.title}
            </Typography>

            {requestId ? (
              <View style={styles.body}>
                <Typography variant="body2" colorKey="TEXT_SECONDARY">
                  {`Nhập mã gồm ${OTP_LENGTH} chữ số đã gửi tới ${normalizedValue}`}
                </Typography>
                <OtpInput code={otp} onCodeChange={setOtp} hasError={Boolean(errorMessage)} />
                {errorMessage ? (
                  <Typography variant="caption" colorKey="ERROR">
                    {errorMessage}
                  </Typography>
                ) : null}
                <Button
                  title={secondsLeft > 0 ? `Gửi lại mã sau ${secondsLeft}s` : 'Gửi lại mã'}
                  variant="ghost"
                  disabled={secondsLeft > 0 || isSubmitting}
                  onPress={() => void handleRequestOtp()}
                />
                <Button
                  title="Xác nhận"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={otp.length !== OTP_LENGTH}
                  onPress={() => void handleVerify()}
                />
              </View>
            ) : (
              <View style={styles.body}>
                <Input
                  label={copy.label}
                  value={value}
                  onChangeText={(text) => {
                    setValue(text);
                    setErrorMessage(undefined);
                  }}
                  placeholder={copy.placeholder}
                  keyboardType={kind === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  errorMessage={errorMessage}
                  leftIcon={<Icon size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
                />
                <Button
                  title="Gửi mã OTP"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={!value.trim()}
                  onPress={() => void handleRequestOtp()}
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP,
  },
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  body: { gap: SPACING_TOKENS.MD, marginTop: SPACING_TOKENS.MD },
});
