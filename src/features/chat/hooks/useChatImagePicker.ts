import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { filterValidUploadImages } from '@core';
import { CHAT_LIMITS } from '../types';

const showPermissionAlert = (message: string) => {
  Alert.alert('Cần quyền truy cập', message, [{ text: 'Đóng' }]);
};

const toValidUris = (assets: ImagePicker.ImagePickerAsset[]): string[] => {
  const { valid, firstError } = filterValidUploadImages(assets);

  if (firstError) showPermissionAlert(firstError);

  return valid.map((asset) => asset.uri);
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

    return result.canceled ? [] : toValidUris(result.assets);
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

    return result.canceled ? [] : toValidUris(result.assets);
  }, []);

  return { pickFromLibrary, takePhoto };
};
