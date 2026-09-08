import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { tokenStorage } from '../storage/token';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

export const getDeviceInfo = async (): Promise<{
  deviceName: string;
  deviceId: string;
}> => {
  let deviceName = Device.modelName || Device.deviceName;

  if (!deviceName) {
    if (Platform.OS === 'ios') {
      deviceName = 'Apple iPhone';
    } else if (Platform.OS === 'android') {
      deviceName = 'Android Device';
    } else {
      deviceName = 'Web Browser';
    }
  }

  let deviceId = await tokenStorage.getDeviceId();

  if (!deviceId) {
    deviceId = `${Platform.OS}_${generateUUID()}`;
    await tokenStorage.setDeviceId(deviceId);
  }

  return { deviceName, deviceId };
};
