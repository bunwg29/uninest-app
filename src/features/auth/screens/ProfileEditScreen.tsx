import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Avatar, Badge, Button, Input, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { authService } from '../services';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'>;

export const ProfileEditScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: authService.getProfile });
  const profile = profileQuery.data;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [bio, setBio] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'idle' | 'phone' | 'otp'>('idle');
  const [newPhone, setNewPhone] = useState('');
  const [phoneRequestId, setPhoneRequestId] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email || '');
      setSchool(profile.school || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => authService.updateProfile({ name, email: email || undefined, school, bio }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đã lưu thay đổi hồ sơ');
      navigation.goBack();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Không thể lưu hồ sơ'),
  });

  const isDirty = profile
    ? name !== profile.name ||
      email !== (profile.email || '') ||
      school !== (profile.school || '') ||
      bio !== (profile.bio || '')
    : false;

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      toast.error('Vui lòng cho phép truy cập thư viện ảnh');

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const contentType = asset.mimeType;

    if (contentType !== 'image/jpeg' && contentType !== 'image/png') {
      toast.error('Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG');

      return;
    }

    const fileName = asset.fileName || `avatar.${contentType === 'image/png' ? 'png' : 'jpg'}`;

    setIsUploadingAvatar(true);

    try {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      const fileSize = fileInfo.exists ? fileInfo.size || 0 : 0;

      if (fileSize <= 0 || fileSize > 5 * 1024 * 1024) {
        throw new Error('Ảnh đại diện phải lớn hơn 0 và tối đa 5MB');
      }

      const presign = await authService.presignAvatar(fileName, contentType, fileSize);

      const uploadResponse = await FileSystem.uploadAsync(presign.uploadUrl, asset.uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': contentType },
      });

      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error('Tải ảnh đại diện lên máy chủ thất bại');
      }

      await authService.confirmAvatar(presign.objectKey);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBack = () => {
    if (!isDirty) {
      navigation.goBack();

      return;
    }

    Alert.alert('Thay đổi chưa được lưu', 'Bạn có chắc muốn rời đi?', [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Rời đi', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const handleRequestPhoneOtp = async () => {
    const cleanPhone = newPhone.trim();

    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(cleanPhone)) {
      toast.error('Số điện thoại không hợp lệ');

      return;
    }

    setIsPhoneLoading(true);

    try {
      const result = await authService.requestPhoneChange(cleanPhone);

      setPhoneRequestId(result.requestId);
      setPhoneStep('otp');
      toast.success('Mã OTP đã được gửi đến số điện thoại mới');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi mã OTP');
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!/^\d{6}$/.test(phoneOtp.trim())) {
      toast.error('Mã OTP phải có đúng 6 chữ số');

      return;
    }

    setIsPhoneLoading(true);

    try {
      await authService.verifyPhoneChange(phoneRequestId, phoneOtp.trim());
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setPhoneStep('idle');
      setNewPhone('');
      setPhoneOtp('');
      setPhoneRequestId('');
      toast.success('Đã cập nhật số điện thoại và xác minh thành công');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mã OTP không chính xác');
    } finally {
      setIsPhoneLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Typography variant="h3" weight="BOLD">
          Chỉnh sửa hồ sơ
        </Typography>
        <View style={styles.headerSpace} />
      </View>

      <View style={styles.avatarBlock}>
        <Avatar uri={profile?.avatarUrl} name={profile?.name} size="xl" />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handlePickAvatar}
          disabled={isUploadingAvatar}
        >
          <Camera size={16} color={THEME_COLORS.SURFACE} />
        </TouchableOpacity>
        <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY}>
          Đổi ảnh đại diện
        </Typography>
      </View>

      <Input
        label="Họ và tên"
        value={name}
        onChangeText={setName}
        leftIcon={<UserRound size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
      />
      <Input
        label="Số điện thoại"
        value={profile?.phone || ''}
        editable={false}
        leftIcon={<Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
        rightIcon={
          profile?.phoneVerified ? (
            <Badge variant="available" size="sm" label="ĐÃ XÁC MINH" />
          ) : undefined
        }
      />
      {phoneStep === 'idle' ? (
        <Text style={styles.phoneHelper}>
          Đổi số điện thoại cần xác thực lại bằng OTP.{' '}
          <Text style={styles.phoneLink} onPress={() => setPhoneStep('phone')}>
            Đổi số
          </Text>
        </Text>
      ) : (
        <View style={styles.phoneFlow}>
          <Typography variant="body2" weight="SEMIBOLD" style={styles.phoneFlowTitle}>
            Xác thực số điện thoại mới
          </Typography>

          {phoneStep === 'phone' ? (
            <>
              <Input
                label="Số điện thoại mới"
                placeholder="0905 123 456"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
                leftIcon={<Phone size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              />
              <Button
                size="md"
                fullWidth
                isLoading={isPhoneLoading}
                onPress={handleRequestPhoneOtp}
              >
                Gửi mã OTP
              </Button>
            </>
          ) : (
            <>
              <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED} style={styles.otpHint}>
                Nhập mã 6 số đã gửi đến {newPhone}
              </Typography>
              <Input
                label="Mã OTP"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={phoneOtp}
                onChangeText={setPhoneOtp}
                leftIcon={<CheckCircle2 size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
              />
              <Button size="md" fullWidth isLoading={isPhoneLoading} onPress={handleVerifyPhoneOtp}>
                Xác nhận số điện thoại
              </Button>
            </>
          )}

          <TouchableOpacity
            style={styles.cancelPhoneButton}
            onPress={() => {
              setPhoneStep('idle');
              setPhoneOtp('');
            }}
          >
            <Typography variant="caption" color={THEME_COLORS.TEXT_MUTED}>
              Huỷ đổi số
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
      />
      <Input
        label="Trường đang học"
        value={school}
        onChangeText={setSchool}
        leftIcon={<GraduationCap size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
      />
      <Input
        label="Giới thiệu ngắn"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        inputContainerStyle={styles.textarea}
      />

      <Button
        fullWidth
        isLoading={mutation.isPending}
        disabled={!isDirty}
        onPress={() => mutation.mutate()}
      >
        Lưu thay đổi
      </Button>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING_TOKENS.LG, paddingVertical: SPACING_TOKENS.MD },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING_TOKENS.XL,
  },
  headerSpace: { width: 24 },
  avatarBlock: { alignItems: 'center', marginBottom: SPACING_TOKENS.XL },
  cameraButton: {
    backgroundColor: THEME_COLORS.PRIMARY,
    borderRadius: 20,
    padding: 8,
    marginTop: -18,
    marginLeft: 56,
    borderWidth: 2,
    borderColor: THEME_COLORS.SURFACE,
  },
  textarea: { height: 100, alignItems: 'flex-start', paddingTop: SPACING_TOKENS.SM },
  phoneHelper: {
    color: THEME_COLORS.TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING_TOKENS.MD,
  },
  phoneLink: { color: THEME_COLORS.PRIMARY, fontWeight: '600' },
  phoneFlow: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    marginBottom: SPACING_TOKENS.MD,
  },
  phoneFlowTitle: { marginBottom: SPACING_TOKENS.SM },
  otpHint: { marginBottom: SPACING_TOKENS.SM },
  cancelPhoneButton: { alignItems: 'center', paddingTop: SPACING_TOKENS.SM },
});
