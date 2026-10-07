import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, GraduationCap, Mail, Phone, UserRound } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Avatar, Badge, Button, Input, ScreenContainer, Typography, BackButton } from '@ui';
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

  return (
    <ScreenContainer scrollable style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
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
    paddingTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.XL,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  headerSpace: { width: 40 },
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
});
