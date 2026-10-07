import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboardHeight = (): number => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    const changeSubscription = Keyboard.addListener('keyboardWillChangeFrame', (event) => {
      setKeyboardHeight(Math.max(event.endCoordinates.height, 0));
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));

    return () => {
      changeSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
};
