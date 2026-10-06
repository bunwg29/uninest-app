import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CHAT_LIMITS } from '../types';

const showPermissionAlert = (message: string) => {
  Alert.alert('Cần quyền truy cập', message, [{ text: 'Đóng' }]);
};

export const useChatImagePicker = () => {
  const pickFromLibrary = useCallback(async (limit: number): Promise<string[]> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showPermissionAlert('Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong Cài đặt');

      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: Math.max(1, Math.min(limit, CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE)),
    });

    return result.canceled ? [] : result.assets.map((asset) => asset.uri);
  }, []);

  const takePhoto = useCallback(async (): Promise<string[]> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showPermissionAlert('Vui lòng cho phép ứng dụng sử dụng máy ảnh trong Cài đặt');

      return [];
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    return result.canceled ? [] : result.assets.map((asset) => asset.uri);
  }, []);

  return { pickFromLibrary, takePhoto };
};
